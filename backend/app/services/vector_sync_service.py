import uuid
from datetime import datetime
from typing import List, Optional, Any
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.models.embedding import Embedding
from app.services.text_preprocessor import preprocess_text
from app.services.chunking_service import default_chunking_service
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_service
from app.core.logging import logger


def process_ai_indexing(
    db: Session,
    document: Document,
    text_content: str,
    pages: Optional[List[Dict[str, Any]]] = None,
    strategy: str = "fixed_overlap"
) -> List[DocumentChunk]:
    """
    Executes AI Foundation Pipeline:
    1. Preprocess & clean extracted text (or use page-aware document blocks).
    2. Chunk clean text according to selected strategy (fixed_no_overlap, fixed_overlap, semantic_paragraph).
    3. Generate 384-dim dense vector embeddings using SentenceTransformers (all-MiniLM-L6-v2).
    4. Store vectors & rich metadata into ChromaDB collection.
    5. Persist DocumentChunk and Embedding records in PostgreSQL.
    6. Update document status to 'completed' / AI Ready.
    """
    # STAGE: Chunking
    document.status = "chunking"
    document.processing_stage = "chunking"
    db.commit()

    if pages:
        raw_chunks = default_chunking_service.chunk_document_pages(pages, strategy=strategy)
    else:
        cleaned_text = preprocess_text(text_content)
        raw_chunks = default_chunking_service.chunk_text(cleaned_text, strategy=strategy)

    if not raw_chunks:
        # Document was empty or whitespace only
        document.status = "completed"
        document.processing_stage = "completed"
        document.processed_at = datetime.utcnow()
        db.commit()
        return []

    # STAGE: Embedding
    document.status = "embedding"
    document.processing_stage = "embedding"
    db.commit()

    texts_to_embed = [c["chunk_text"] for c in raw_chunks]
    embeddings_list = embedding_service.generate_embeddings(texts_to_embed)

    # STAGE: Vector Indexed
    document.status = "vector_indexed"
    document.processing_stage = "vector_indexed"
    db.commit()

    # Create DocumentChunk DB objects
    db_chunks = []
    for c_data in raw_chunks:
        db_chunk = DocumentChunk(
            id=uuid.uuid4(),
            document_id=document.id,
            knowledge_id=document.knowledge_id,
            user_id=document.user_id,
            chunk_index=c_data["chunk_index"],
            chunk_text=c_data["chunk_text"],
            token_count=c_data["token_count"],
            character_count=c_data["character_count"],
            metadata_json={
                "original_filename": document.original_filename,
                "file_extension": document.file_extension,
                "chunk_index": c_data["chunk_index"],
                "page_number": c_data.get("page_number", 1),
                "section_title": c_data.get("section_title", ""),
                "strategy": c_data.get("strategy", strategy)
            }
        )
        db.add(db_chunk)
        db_chunks.append(db_chunk)
        c_data["db_chunk_id"] = db_chunk.id

    db.commit()
    for chunk_obj in db_chunks:
        db.refresh(chunk_obj)

    # Upsert into ChromaDB
    doc_metadata = {
        "title": document.original_filename,
        "original_filename": document.original_filename,
        "file_extension": document.file_extension,
        "upload_date": document.uploaded_at.isoformat() if document.uploaded_at else ""
    }

    vector_ids = vector_store_service.upsert_chunks(
        user_id=str(document.user_id),
        document_id=str(document.id),
        knowledge_id=str(document.knowledge_id) if document.knowledge_id else None,
        chunks=raw_chunks,
        embeddings=embeddings_list,
        document_metadata=doc_metadata
    )

    # Save Embedding DB models
    for db_chunk, v_id in zip(db_chunks, vector_ids):
        db_emb = Embedding(
            id=uuid.uuid4(),
            chunk_id=db_chunk.id,
            embedding_model="all-MiniLM-L6-v2",
            embedding_dimension=384,
            vector_id=v_id
        )
        db.add(db_emb)

    db.commit()
    return db_chunks


def delete_document_vectors(db: Session, user_id: uuid.UUID, document_id: uuid.UUID, knowledge_id: Optional[uuid.UUID] = None):
    """
    Deletes all associated chunks & vectors from PostgreSQL and ChromaDB.
    """
    vector_store_service.delete_chunks_by_document(str(user_id), str(document_id))
    if knowledge_id:
        vector_store_service.delete_chunks_by_knowledge(str(user_id), str(knowledge_id))

    # Cascade delete in DB handles DocumentChunk and Embedding tables
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete(synchronize_session=False)
    db.commit()


def rebuild_document_vectors(db: Session, document: Document, text_content: str):
    """
    Rebuilds chunks and vector embeddings when a document is updated.
    """
    delete_document_vectors(db, document.user_id, document.id, document.knowledge_id)
    return process_ai_indexing(db, document, text_content)


def process_knowledge_indexing(db: Session, knowledge: Any, text_content: str) -> List[DocumentChunk]:
    """
    Executes AI Preprocessing, Chunking, Embedding & Vector Indexing for raw knowledge items (notes).
    """
    cleaned_text = preprocess_text(text_content)
    raw_chunks = default_chunking_service.chunk_text(cleaned_text)

    if not raw_chunks:
        return []

    # Create DocumentChunk DB objects
    db_chunks = []
    for c_data in raw_chunks:
        db_chunk = DocumentChunk(
            id=uuid.uuid4(),
            document_id=None,  # Nullable!
            knowledge_id=knowledge.id,
            user_id=knowledge.user_id,
            chunk_index=c_data["chunk_index"],
            chunk_text=c_data["chunk_text"],
            token_count=c_data["token_count"],
            character_count=c_data["character_count"],
            metadata_json={
                "original_filename": "",
                "file_extension": ".md",
                "chunk_index": c_data["chunk_index"]
            }
        )
        db.add(db_chunk)
        db_chunks.append(db_chunk)
        c_data["db_chunk_id"] = db_chunk.id

    db.commit()
    for chunk_obj in db_chunks:
        db.refresh(chunk_obj)

    # Upsert into ChromaDB
    doc_metadata = {
        "title": knowledge.title,
        "original_filename": "",
        "file_extension": ".md",
        "upload_date": knowledge.created_at.isoformat() if knowledge.created_at else datetime.utcnow().isoformat()
    }

    vector_ids = vector_store_service.upsert_chunks(
        user_id=str(knowledge.user_id),
        document_id=None,
        knowledge_id=str(knowledge.id),
        chunks=raw_chunks,
        embeddings=embedding_service.generate_embeddings([c["chunk_text"] for c in raw_chunks]),
        document_metadata=doc_metadata
    )

    # Save Embedding DB models
    for db_chunk, v_id in zip(db_chunks, vector_ids):
        db_emb = Embedding(
            id=uuid.uuid4(),
            chunk_id=db_chunk.id,
            embedding_model="all-MiniLM-L6-v2",
            embedding_dimension=384,
            vector_id=v_id
        )
        db.add(db_emb)

    db.commit()
    return db_chunks


def delete_knowledge_vectors(db: Session, user_id: uuid.UUID, knowledge_id: uuid.UUID):
    """
    Deletes all associated chunks & vectors for a knowledge item from ChromaDB and PostgreSQL.
    """
    vector_store_service.delete_chunks_by_knowledge(str(user_id), str(knowledge_id))
    db.query(DocumentChunk).filter(DocumentChunk.knowledge_id == knowledge_id).delete(synchronize_session=False)
    db.commit()


def rebuild_knowledge_vectors(db: Session, knowledge: Any, text_content: str):
    """
    Purges old chunks/vectors and re-indexes the knowledge note content.
    """
    delete_knowledge_vectors(db, knowledge.user_id, knowledge.id)
    return process_knowledge_indexing(db, knowledge, text_content)
