import os
import uuid
from typing import List, Dict, Any, Optional
from app.core.logging import logger

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
except ImportError:
    chromadb = None

CHROMA_STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "chroma_db")
COLLECTION_NAME = "vaultonaut_documents"


class VectorStoreService:
    def __init__(self):
        self.client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        if chromadb is None:
            logger.warning("ChromaDB is not installed.")
            return

        try:
            os.makedirs(CHROMA_STORAGE_DIR, exist_ok=True)
            self.client = chromadb.PersistentClient(path=CHROMA_STORAGE_DIR)
            self.collection = self.client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"ChromaDB initialized at '{CHROMA_STORAGE_DIR}' (collection='{COLLECTION_NAME}').")
        except Exception as err:
            logger.error(f"Failed to initialize ChromaDB: {err}")
            self.client = None
            self.collection = None

    @property
    def is_available(self) -> bool:
        return self.collection is not None

    def upsert_chunks(
        self,
        user_id: str,
        document_id: str,
        knowledge_id: Optional[str],
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
        document_metadata: Dict[str, Any]
    ) -> List[str]:
        """
        Stores chunk vectors and metadata into ChromaDB collection.
        Returns list of vector IDs generated for each chunk.
        """
        if not self.is_available or not chunks or not embeddings:
            return []

        vector_ids = []
        documents_text = []
        embeddings_list = []
        metadatas = []

        for idx, (chunk_data, vector) in enumerate(zip(chunks, embeddings)):
            v_id = f"vec_{chunk_data.get('db_chunk_id', uuid.uuid4())}"
            vector_ids.append(v_id)
            documents_text.append(chunk_data["chunk_text"])
            embeddings_list.append(vector)

            meta = {
                "user_id": str(user_id),
                "document_id": str(document_id),
                "knowledge_id": str(knowledge_id) if knowledge_id else "",
                "chunk_index": chunk_data["chunk_index"],
                "character_count": chunk_data["character_count"],
                "token_count": chunk_data["token_count"],
                "page_number": int(chunk_data.get("page_number", 1)),
                "section_title": str(chunk_data.get("section_title", "")),
                "strategy": str(chunk_data.get("strategy", "fixed_overlap")),
                "title": document_metadata.get("title", ""),
                "original_filename": document_metadata.get("original_filename", ""),
                "category": document_metadata.get("category", "General"),
                "file_extension": document_metadata.get("file_extension", ""),
                "upload_date": document_metadata.get("upload_date", "")
            }
            metadatas.append(meta)

        try:
            self.collection.upsert(
                ids=vector_ids,
                embeddings=embeddings_list,
                documents=documents_text,
                metadatas=metadatas
            )
            return vector_ids
        except Exception as err:
            logger.error(f"Failed to upsert vectors into ChromaDB: {err}")
            raise RuntimeError(f"ChromaDB vector insertion failed: {err}")

    def delete_chunks_by_document(self, user_id: str, document_id: str):
        """Deletes all vector embeddings associated with a specific document."""
        if not self.is_available:
            return
        try:
            self.collection.delete(
                where={"$and": [{"user_id": str(user_id)}, {"document_id": str(document_id)}]}
            )
        except Exception as err:
            logger.warn(f"ChromaDB delete by document notice: {err}")

    def delete_chunks_by_knowledge(self, user_id: str, knowledge_id: str):
        """Deletes all vector embeddings associated with a specific knowledge item."""
        if not self.is_available:
            return
        try:
            self.collection.delete(
                where={"$and": [{"user_id": str(user_id)}, {"knowledge_id": str(knowledge_id)}]}
            )
        except Exception as err:
            logger.warn(f"ChromaDB delete by knowledge notice: {err}")

    def similarity_query(
        self,
        user_id: str,
        query_embedding: List[float],
        top_k: int = 5,
        score_threshold: Optional[float] = None,
        document_id: Optional[str] = None,
        knowledge_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes vector similarity search strictly scoped to user_id.
        Optionally filters by document_id or knowledge_id.
        """
        if not self.is_available or not query_embedding:
            return []

        where_conditions = [{"user_id": str(user_id)}]
        if document_id:
            where_conditions.append({"document_id": str(document_id)})
        if knowledge_id:
            where_conditions.append({"knowledge_id": str(knowledge_id)})

        where_clause = {"$and": where_conditions} if len(where_conditions) > 1 else where_conditions[0]

        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_clause,
                include=["documents", "metadatas", "distances"]
            )



            retrieved_chunks = []
            if results and results.get("ids") and len(results["ids"]) > 0:
                ids = results["ids"][0]
                docs = results["documents"][0]
                metas = results["metadatas"][0]
                distances = results["distances"][0]

                for v_id, text, meta, dist in zip(ids, docs, metas, distances):
                    similarity_score = round(1.0 - dist, 4) if dist is not None else 0.0
                    
                    if score_threshold is not None and similarity_score < score_threshold:
                        continue

                    retrieved_chunks.append({
                        "vector_id": v_id,
                        "chunk_text": text,
                        "similarity_score": similarity_score,
                        "distance": dist,
                        "metadata": meta
                    })

            return retrieved_chunks
        except Exception as err:
            logger.error(f"ChromaDB similarity search error: {err}")
            return []


vector_store_service = VectorStoreService()
