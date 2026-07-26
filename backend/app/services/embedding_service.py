import threading
from typing import List, Optional
from app.core.logging import logger

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384


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

        self.model_name = MODEL_NAME
        self.dimension = EMBEDDING_DIMENSION
        self._model = None

        if SentenceTransformer is not None:
            try:
                logger.info(f"Loading Embedding Model '{MODEL_NAME}' into memory...")
                self._model = SentenceTransformer(MODEL_NAME)
                logger.info(f"Embedding Model '{MODEL_NAME}' loaded successfully (dim={EMBEDDING_DIMENSION}).")
            except Exception as err:
                logger.error(f"Failed to load SentenceTransformer model '{MODEL_NAME}': {err}")
                self._model = None
        else:
            logger.warning("sentence-transformers package is not installed.")

        self._initialized = True

    @property
    def is_available(self) -> bool:
        return self._model is not None

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates 384-dimensional dense vector embeddings for a list of text strings.
        """
        if not texts:
            return []

        if self._model is None:
            logger.warning("Embedding model not loaded. Returning zero fallback vectors.")
            return [[0.0] * EMBEDDING_DIMENSION for _ in texts]

        try:
            embeddings = self._model.encode(
                texts,
                batch_size=32,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            return [vec.tolist() for vec in embeddings]
        except Exception as err:
            logger.error(f"Error generating embeddings: {err}")
            raise RuntimeError(f"Embedding generation failed: {err}")

    def generate_query_embedding(self, query: str) -> List[float]:
        """
        Generates embedding vector for a single search query string.
        """
        if not query or not query.strip():
            return [0.0] * EMBEDDING_DIMENSION
        results = self.generate_embeddings([query.strip()])
        return results[0] if results else [0.0] * EMBEDDING_DIMENSION


embedding_service = EmbeddingService()
