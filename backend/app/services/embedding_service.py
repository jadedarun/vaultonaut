import os
import json
import sqlite3
import hashlib
import threading
from typing import List, Dict, Any, Optional, Tuple
from app.core.logging import logger

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.config.settings import settings

DEFAULT_MODEL_NAME = "all-MiniLM-L6-v2"
MODEL_DIMENSIONS = {
    "all-MiniLM-L6-v2": 384,
    "text-embedding-004": 768
}

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "embedding_cache")
CACHE_DB_PATH = os.path.join(CACHE_DIR, "cache.db")


class EmbeddingCache:
    """
    Thread-safe persistent vector embedding cache.
    Uses SQLite backend to eliminate redundant re-encoding during evaluation sweeps and repeated queries.
    """
    def __init__(self, db_path: str = CACHE_DB_PATH):
        self.db_path = db_path
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0
        self._memory_cache: Dict[str, List[float]] = {}
        self._init_db()

    def _init_db(self):
        try:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS embeddings (
                        cache_key TEXT PRIMARY KEY,
                        model_name TEXT NOT NULL,
                        vector_json TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
        except Exception as e:
            logger.warning(f"Failed to initialize SQLite embedding cache at {self.db_path}: {e}")

    def _make_key(self, model_name: str, text: str) -> str:
        content = f"{model_name}:{text.strip()}".encode("utf-8")
        return hashlib.sha256(content).hexdigest()

    def get_many(self, model_name: str, texts: List[str]) -> Tuple[Dict[int, List[float]], List[Tuple[int, str]]]:
        """
        Retrieves cached embeddings for texts.
        Returns:
            (cached_map: {original_index: vector}, missing_items: [(original_index, text)])
        """
        cached_map = {}
        missing_items = []

        with self._lock:
            for idx, txt in enumerate(texts):
                key = self._make_key(model_name, txt)
                # Check memory cache first
                if key in self._memory_cache:
                    cached_map[idx] = self._memory_cache[key]
                    self.hits += 1
                    continue

                # Check SQLite disk cache
                vector = self._read_disk(key)
                if vector is not None:
                    self._memory_cache[key] = vector
                    cached_map[idx] = vector
                    self.hits += 1
                else:
                    self.misses += 1
                    missing_items.append((idx, txt))

        return cached_map, missing_items

    def _read_disk(self, cache_key: str) -> Optional[List[float]]:
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT vector_json FROM embeddings WHERE cache_key = ?", (cache_key,))
                row = cursor.fetchone()
                if row:
                    return json.loads(row[0])
        except Exception:
            pass
        return None

    def put_many(self, model_name: str, items: List[Tuple[str, List[float]]]):
        """Persists newly computed vectors into memory and SQLite cache."""
        if not items:
            return

        records_to_insert = []
        with self._lock:
            for txt, vec in items:
                key = self._make_key(model_name, txt)
                self._memory_cache[key] = vec
                records_to_insert.append((key, model_name, json.dumps(vec)))

            try:
                with sqlite3.connect(self.db_path) as conn:
                    conn.executemany(
                        "INSERT OR REPLACE INTO embeddings (cache_key, model_name, vector_json) VALUES (?, ?, ?)",
                        records_to_insert
                    )
                    conn.commit()
            except Exception as e:
                logger.warning(f"Error persisting to embedding cache: {e}")

    def get_stats(self) -> Dict[str, Any]:
        with self._lock:
            total_requests = self.hits + self.misses
            hit_rate = round((self.hits / total_requests) * 100, 2) if total_requests > 0 else 0.0
            
            disk_count = 0
            try:
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT COUNT(*) FROM embeddings")
                    disk_count = cursor.fetchone()[0]
            except Exception:
                disk_count = len(self._memory_cache)

            return {
                "hits": self.hits,
                "misses": self.misses,
                "total_queries": total_requests,
                "hit_rate_pct": hit_rate,
                "cached_vectors_count": disk_count,
                "memory_cached_count": len(self._memory_cache)
            }

    def clear(self):
        with self._lock:
            self._memory_cache.clear()
            self.hits = 0
            self.misses = 0
            try:
                with sqlite3.connect(self.db_path) as conn:
                    conn.execute("DELETE FROM embeddings")
                    conn.commit()
            except Exception:
                pass


class EmbeddingService:
    _instance: Optional['EmbeddingService'] = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(EmbeddingService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.model_name = DEFAULT_MODEL_NAME
        self.dimension = MODEL_DIMENSIONS.get(self.model_name, 384)
        self._model = None
        self.cache = EmbeddingCache()

        if SentenceTransformer is not None:
            try:
                logger.info(f"Loading Embedding Model '{self.model_name}' into memory...")
                self._model = SentenceTransformer(self.model_name)
                logger.info(f"Embedding Model '{self.model_name}' loaded successfully (dim={self.dimension}).")
            except Exception as err:
                logger.error(f"Failed to load SentenceTransformer model '{self.model_name}': {err}")
                self._model = None
        else:
            logger.warning("sentence-transformers package is not installed.")

        self._initialized = True

    @property
    def is_available(self) -> bool:
        return self._model is not None

    def get_cache_stats(self) -> Dict[str, Any]:
        return self.cache.get_stats()

    def clear_cache(self):
        self.cache.clear()

    def _generate_gemini_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings using Google Gemini API text-embedding-004."""
        if genai is None or not settings.GEMINI_API_KEY:
            raise RuntimeError("Gemini API key not configured for text-embedding-004.")
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        results = []
        for text in texts:
            response = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            results.append(response["embedding"])
        return results

    def generate_embeddings(self, texts: List[str], model_name: Optional[str] = None) -> List[List[float]]:
        """
        Generates dense vector embeddings for a list of text strings with caching.
        Checks EmbeddingCache before invoking embedding models.
        """
        if not texts:
            return []

        active_model = model_name or self.model_name
        dim = MODEL_DIMENSIONS.get(active_model, self.dimension)

        # 1. Lookup in cache
        cached_map, missing_items = self.cache.get_many(active_model, texts)

        # 2. If all were cached, assemble and return immediately
        if not missing_items:
            return [cached_map[i] for i in range(len(texts))]

        # 3. Compute embeddings for missing items only
        missing_indices = [idx for idx, _ in missing_items]
        missing_texts = [txt for _, txt in missing_items]

        new_vectors = []
        if active_model == "text-embedding-004":
            try:
                new_vectors = self._generate_gemini_embeddings(missing_texts)
            except Exception as err:
                logger.error(f"Failed to generate Gemini embeddings: {err}. Falling back to MiniLM.")
                active_model = DEFAULT_MODEL_NAME
                new_vectors = self._model.encode(missing_texts, batch_size=32, show_progress_bar=False, convert_to_numpy=True).tolist() if self._model else [[0.0] * dim for _ in missing_texts]
        else:
            if self._model is None:
                logger.warning("Embedding model not loaded. Returning zero fallback vectors.")
                new_vectors = [[0.0] * dim for _ in missing_texts]
            else:
                try:
                    embeddings = self._model.encode(
                        missing_texts,
                        batch_size=32,
                        show_progress_bar=False,
                        convert_to_numpy=True
                    )
                    new_vectors = [vec.tolist() for vec in embeddings]
                except Exception as err:
                    logger.error(f"Error generating embeddings with {active_model}: {err}")
                    raise RuntimeError(f"Embedding generation failed: {err}")

        # 4. Save newly computed embeddings into cache
        items_to_persist = list(zip(missing_texts, new_vectors))
        self.cache.put_many(active_model, items_to_persist)

        for idx, vec in zip(missing_indices, new_vectors):
            cached_map[idx] = vec

        # 5. Return complete list in original order
        return [cached_map[i] for i in range(len(texts))]

    def generate_query_embedding(self, query: str, model_name: Optional[str] = None) -> List[float]:
        """
        Generates embedding vector for a single search query string with caching.
        """
        if not query or not query.strip():
            dim = MODEL_DIMENSIONS.get(model_name or self.model_name, self.dimension)
            return [0.0] * dim
        results = self.generate_embeddings([query.strip()], model_name=model_name)
        dim = MODEL_DIMENSIONS.get(model_name or self.model_name, self.dimension)
        return results[0] if results else [0.0] * dim


embedding_service = EmbeddingService()

