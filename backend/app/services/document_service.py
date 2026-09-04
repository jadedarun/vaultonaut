import uuid
from datetime import datetime
from typing import Tuple, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from fastapi import HTTPException, status, UploadFile

import json
import threading
from app.core.logging import logger

from app.models.document import Document
from app.models.knowledge import Knowledge
from app.schemas.knowledge import KnowledgeCreate
from app.services import storage_service
from app.services import document_extractor
from app.services import knowledge_service
from app.services import vector_sync_service
from app.models.chunk import DocumentChunk
from app.models.embedding import Embedding


# Thread-safe set of documents currently generating flashcards/quizzes
generating_flashcards_docs = set()
generating_lock = threading.Lock()

def is_generating_flashcards(document_id: str) -> bool:
    with generating_lock:
        return document_id in generating_flashcards_docs

def set_generating_flashcards(document_id: str, is_generating: bool):
    with generating_lock:
        if is_generating:
            generating_flashcards_docs.add(document_id)
        else:
            generating_flashcards_docs.discard(document_id)


def generate_study_materials_background(document_id_str: str, user_id_str: str, document_text: str):
    """
    Background worker thread to generate flashcards and quiz using Gemini.
    """
    set_generating_flashcards(document_id_str, True)
    logger.info(f"Background flashcard/quiz generation started for document {document_id_str}")
    
    from app.database.session import SessionLocal
    db = SessionLocal()
    try:
        document_id = uuid.UUID(document_id_str)
        user_id = uuid.UUID(user_id_str)
        
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.error(f"Document {document_id_str} not found in background thread.")
            return

        from app.services.rag.providers.factory import LLMProviderFactory
        provider = LLMProviderFactory.get_provider("gemini")

        # 1. Generate Flashcards
        existing_fc = db.query(Knowledge).filter(
            Knowledge.user_id == user_id,
            Knowledge.category == "Flashcards",
            Knowledge.title == f"Flashcards - {document_id_str}"
        ).first()
        
        if not existing_fc:
            fc_system_prompt = """You are an AI study assistant. Your task is to generate a set of high-quality, educational flashcards from the provided document content.
Each flashcard must have a question (q) and an answer (a).
The cards must be grounded strictly in the document content.
Ensure they cover definitions, key concepts, comparisons, and important facts.
Respond with a valid JSON array of objects, where each object has exactly two keys: "q" and "a".
Example format:
[
  {"q": "What is HTML?", "a": "HTML stands for HyperText Markup Language and is used to structure web pages."}
]
Do not include any other text, markdown formatting, or explanation. Output ONLY the JSON array."""

            fc_prompt = f"""Generate 6-12 high-quality study flashcards based on the following document:

DOCUMENT TITLE: {doc.original_filename}

DOCUMENT CONTENT:
{document_text[:20000]}
"""
            try:
                llm_output = provider.generate_response(
                    prompt=fc_prompt,
                    system_prompt=fc_system_prompt,
                    temperature=0.2,
                    max_tokens=4096,
                    response_mime_type="application/json"
                )
                content = llm_output.get("content", "").strip()
                if content.startswith("```"):
                    lines = content.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines[-1].startswith("```"):
                        lines = lines[:-1]
                    content = "\n".join(lines).strip()
                parsed_cards = json.loads(content)
                if isinstance(parsed_cards, list) and len(parsed_cards) > 0:
                    knowledge_fc = Knowledge(
                        id=uuid.uuid4(),
                        user_id=user_id,
                        title=f"Flashcards - {document_id_str}",
                        content=json.dumps(parsed_cards),
                        category="Flashcards",
                        tags=[doc.file_extension.replace(".", "").upper(), "Flashcard"],
                        favorite=False,
                        pinned=False,
                        summary=f"Auto-generated flashcards for {doc.original_filename}"
                    )
                    db.add(knowledge_fc)
                    db.commit()
                    logger.info(f"Successfully generated and saved {len(parsed_cards)} flashcards for document {document_id_str}")
            except Exception as fc_err:
                logger.error(f"Failed to generate flashcards: {fc_err}. Raw content: {content}")

        # 2. Generate Quiz
        existing_quiz = db.query(Knowledge).filter(
            Knowledge.user_id == user_id,
            Knowledge.category == "Quizzes",
            Knowledge.title == f"Quiz - {document_id_str}"
        ).first()
        
        if not existing_quiz:
            quiz_system_prompt = """You are an AI study assistant. Your task is to generate a high-quality multiple choice quiz based strictly on the provided document content.
Generate a valid JSON object containing a list of questions under the key "questions".
Each question object must have:
- "question": The question text.
- "options": An array of 4 option strings.
- "answer_idx": The index (0-3) of the correct option.
- "explanation": A detailed explanation of why this option is correct.

Example format:
{
  "questions": [
    {
      "question": "Which protocol is stateless?",
      "options": ["HTTP", "TCP", "FTP", "SMTP"],
      "answer_idx": 0,
      "explanation": "HTTP is stateless because each request is executed independently, without knowledge of previous requests."
    }
  ]
}
Do not include any other text, markdown formatting, or explanation. Output ONLY the JSON object."""

            quiz_prompt = f"""Generate a 4-question multiple choice quiz based on the following document:

DOCUMENT TITLE: {doc.original_filename}

DOCUMENT CONTENT:
{document_text[:20000]}
"""
            try:
                llm_output = provider.generate_response(
                    prompt=quiz_prompt,
                    system_prompt=quiz_system_prompt,
                    temperature=0.2,
                    max_tokens=4096,
                    response_mime_type="application/json"
                )
                content = llm_output.get("content", "").strip()
                if content.startswith("```"):
                    lines = content.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines[-1].startswith("```"):
                        lines = lines[:-1]
                    content = "\n".join(lines).strip()
                parsed_quiz = json.loads(content)
                if "questions" in parsed_quiz:
                    knowledge_quiz = Knowledge(
                        id=uuid.uuid4(),
                        user_id=user_id,
                        title=f"Quiz - {document_id_str}",
                        content=json.dumps(parsed_quiz),
                        category="Quizzes",
                        tags=[doc.file_extension.replace(".", "").upper(), "Quiz"],
                        favorite=False,
                        pinned=False,
                        summary=f"Auto-generated quiz for {doc.original_filename}"
                    )
                    db.add(knowledge_quiz)
                    db.commit()
                    logger.info(f"Successfully generated and saved quiz for document {document_id_str}")
            except Exception as quiz_err:
                logger.error(f"Failed to generate quiz: {quiz_err}. Raw content: {content}")
                
    except Exception as e:
        logger.error(f"Error in study materials background generator for document {document_id_str}: {e}")
    finally:
        db.close()
        set_generating_flashcards(document_id_str, False)


def check_duplicate_document(db: Session, user_id: uuid.UUID, checksum_sha256: str) -> bool:
    """Checks if a document with identical SHA-256 checksum already exists for this user."""
    existing = db.query(Document).filter(
        Document.user_id == user_id,
        Document.checksum_sha256 == checksum_sha256
    ).first()
    return existing is not None


def process_document_pipeline(
    db: Session,
    user_id: uuid.UUID,
    original_filename: str,
    content: bytes,
    content_type: Optional[str] = None
) -> Document:
    """
    Executes the 6-stage document ingestion pipeline:
    1. Uploading -> Validate file & check duplicate SHA-256 hash.
    2. Stored -> Save file to secure disk storage & save initial DB model.
    3. Text Extraction -> Extract raw text from file.
    4. Metadata Extraction -> Calculate page count, word count, reading time, language.
    5. Knowledge Creation -> Auto-create Knowledge entry in Knowledge Vault.
    6. Completed -> Finalize processing and set timestamp.
    """
    # STAGE 1: Uploading & Validation
    storage_info = storage_service.save_uploaded_file(str(user_id), original_filename, content)
    
    # Duplicate Detection
    if check_duplicate_document(db, user_id, storage_info["checksum_sha256"]):
        # Clean up temporary saved file
        storage_service.delete_file_from_storage(storage_info["storage_path"])
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate file detected. A document with matching SHA-256 checksum already exists in your vault."
        )

    # STAGE 2: Stored (Create Document DB Record)
    mime_type = content_type or "application/octet-stream"
    document = Document(
        id=uuid.uuid4(),
        user_id=user_id,
        knowledge_id=None,
        original_filename=storage_info["original_filename"],
        stored_filename=storage_info["stored_filename"],
        file_extension=storage_info["file_extension"],
        mime_type=mime_type,
        file_size=storage_info["file_size"],
        storage_path=storage_info["storage_path"],
        status="stored",
        processing_stage="stored",
        checksum_sha256=storage_info["checksum_sha256"]
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        # STAGE 3: Text Extraction
        document.status = "text_extraction"
        document.processing_stage = "text_extraction"
        db.commit()

        extracted = document_extractor.extract_document(
            file_path=document.storage_path,
            file_extension=document.file_extension,
            original_filename=document.original_filename
        )

        # STAGE 4: Metadata Extraction
        document.status = "metadata_extraction"
        document.processing_stage = "metadata_extraction"
        document.page_count = extracted.page_count
        document.word_count = extracted.word_count
        document.reading_time = extracted.reading_time
        document.language = extracted.language
        db.commit()

        # STAGE 5: Knowledge Creation
        document.status = "knowledge_creation"
        document.processing_stage = "knowledge_creation"
        db.commit()

        # Automatically create Knowledge entry in Knowledge Vault
        knowledge_data = KnowledgeCreate(
            title=extracted.title or document.original_filename,
            content=extracted.text or "(Empty document content)",
            category="Documents",
            tags=[document.file_extension.replace(".", "").upper(), "Ingested"],
            favorite=False,
            pinned=False,
            summary=None
        )
        knowledge_entry = knowledge_service.create_knowledge(db, user_id, knowledge_data)
        
        # Link Document to Knowledge entry
        document.knowledge_id = knowledge_entry.id
        db.commit()

        # STAGE 6: AI Preprocessing, Chunking, Embedding & Vector Indexing
        vector_sync_service.process_ai_indexing(db, document, extracted.text, pages=extracted.pages)

        document.status = "completed"
        document.processing_stage = "completed"
        document.processed_at = datetime.utcnow()
        db.commit()
        db.refresh(document)

        # Trigger background task for flashcard/quiz generation
        try:
            thread = threading.Thread(
                target=generate_study_materials_background,
                args=(str(document.id), str(document.user_id), extracted.text)
            )
            thread.daemon = True
            thread.start()
        except Exception as e:
            logger.error(f"Failed to start background flashcard generation thread: {e}")

        return document

    except Exception as err:
        db.rollback()
        document.status = "failed"
        document.processing_stage = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing pipeline failed: {str(err)}"
        )


def get_user_documents_list(
    db: Session,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 10,
    status_filter: Optional[str] = None,
    extension_filter: Optional[str] = None,
    query: Optional[str] = None
) -> Tuple[List[Document], int, int]:
    """Retrieves paginated documents list for authenticated user."""
    base_query = db.query(Document).filter(Document.user_id == user_id)
    
    if status_filter:
        base_query = base_query.filter(Document.status == status_filter)
    if extension_filter:
        ext = extension_filter if extension_filter.startswith(".") else f".{extension_filter}"
        base_query = base_query.filter(Document.file_extension == ext.lower())
    if query:
        search_pattern = f"%{query.strip()}%"
        base_query = base_query.filter(Document.original_filename.ilike(search_pattern))
        
    total = base_query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    
    items = base_query.order_by(Document.uploaded_at.desc()) \
                      .offset((page - 1) * page_size) \
                      .limit(page_size) \
                      .all()
                      
    return items, total, total_pages


def get_document_by_id(db: Session, document_id: uuid.UUID, user_id: uuid.UUID) -> Document:
    """Gets single document owned by user or raises 404/403."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    if doc.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not own this document"
        )
    return doc


def delete_document(db: Session, document_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    """Deletes document DB record, storage file, disassociates linked knowledge, and cleans up ChromaDB vectors."""
    doc = get_document_by_id(db, document_id, user_id)
    
    # Delete chunks and vector embeddings from PostgreSQL and ChromaDB
    vector_sync_service.delete_document_vectors(db, user_id, document_id, doc.knowledge_id)

    storage_service.delete_file_from_storage(doc.storage_path)
    db.delete(doc)
    db.commit()
    return True


def get_document_statistics(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
    """Calculates dashboard document & AI vector statistics for authenticated user."""
    total_documents = db.query(func.count(Document.id)).filter(Document.user_id == user_id).scalar() or 0
    completed_count = db.query(func.count(Document.id)).filter(
        Document.user_id == user_id, Document.status == "completed"
    ).scalar() or 0
    failed_count = db.query(func.count(Document.id)).filter(
        Document.user_id == user_id, Document.status == "failed"
    ).scalar() or 0
    processing_count = db.query(func.count(Document.id)).filter(
        Document.user_id == user_id, Document.status.in_(["uploading", "stored", "text_extraction", "metadata_extraction", "knowledge_creation", "chunking", "embedding", "vector_indexed"])
    ).scalar() or 0

    total_storage_bytes = db.query(func.sum(Document.file_size)).filter(Document.user_id == user_id).scalar() or 0

    # Chunks and Vectors stats
    chunks_created = db.query(func.count(DocumentChunk.id)).filter(DocumentChunk.user_id == user_id).scalar() or 0
    vectors_stored = db.query(func.count(Embedding.id)).join(
        DocumentChunk, Embedding.chunk_id == DocumentChunk.id
    ).filter(DocumentChunk.user_id == user_id).scalar() or 0

    avg_chunk_char = db.query(func.avg(DocumentChunk.character_count)).filter(DocumentChunk.user_id == user_id).scalar()
    avg_chunk_size = round(float(avg_chunk_char), 1) if avg_chunk_char else 800.0

    # File type breakdown
    type_counts = db.query(
        Document.file_extension, func.count(Document.id)
    ).filter(Document.user_id == user_id).group_by(Document.file_extension).all()

    file_types = {ext.replace(".", "").upper(): count for ext, count in type_counts}

    # Fetch Conversations and Flashcards
    from app.models.conversation import Conversation, ConversationMessage
    total_conversations = db.query(func.count(Conversation.id)).filter(Conversation.user_id == user_id).scalar() or 0
    total_questions = db.query(func.count(ConversationMessage.id)).join(
        Conversation, ConversationMessage.conversation_id == Conversation.id
    ).filter(Conversation.user_id == user_id, ConversationMessage.role == "user").scalar() or 0
    
    total_flashcards = 0
    flashcard_entries = db.query(Knowledge).filter(Knowledge.user_id == user_id, Knowledge.category == "Flashcards").all()
    for entry in flashcard_entries:
        try:
            cards = json.loads(entry.content)
            total_flashcards += len(cards)
        except Exception:
            pass

    total_quizzes = db.query(func.count(Knowledge.id)).filter(
        Knowledge.user_id == user_id,
        Knowledge.category == "Quizzes"
    ).scalar() or 0
    
    total_flashcard_decks = len(flashcard_entries)
    total_study_materials = total_flashcard_decks + total_quizzes

    return {
        "total_documents": total_documents,
        "completed_count": completed_count,
        "failed_count": failed_count,
        "processing_count": processing_count,
        "total_storage_bytes": total_storage_bytes,
        "total_storage_mb": round(total_storage_bytes / (1024 * 1024), 2),
        "file_types": file_types,
        "chunks_created": chunks_created,
        "vectors_stored": vectors_stored,
        "documents_indexed": completed_count,
        "avg_chunk_size": avg_chunk_size,
        "embedding_model": "all-MiniLM-L6-v2",
        "ai_ready_count": completed_count,
        "total_conversations": total_conversations,
        "total_flashcards": total_flashcards,
        "total_questions": total_questions,
        "total_quizzes": total_quizzes,
        "total_flashcard_decks": total_flashcard_decks,
        "total_study_materials": total_study_materials
    }
