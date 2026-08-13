import io
import uuid
import pytest
from app.models.user import User
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.models.embedding import Embedding
from app.core.security import create_access_token
from app.services.text_preprocessor import preprocess_text
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_service


@pytest.fixture
def test_user(db_session):
    user = User(
        id=uuid.uuid4(),
        google_id="google_ai_123",
        email="aiuser@example.com",
        full_name="AI Foundation Test User",
        email_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(user_id=test_user.id, email=test_user.email)
    return {"Authorization": f"Bearer {token}"}


def test_text_preprocessor():
    raw_text = "  Hello \x00World!   \n\n\n\n# Markdown Heading\n\nParagraph 1.\n\n\nParagraph 2.  "
    cleaned = preprocess_text(raw_text)
    assert "World!" in cleaned
    assert "# Markdown Heading" in cleaned
    assert "\x00" not in cleaned
    assert "\n\n\n" not in cleaned  # Max 2 consecutive newlines


def test_chunking_service():
    chunker = ChunkingService(chunk_size=100, chunk_overlap=20)
    sample_text = "Vaultonaut is a personal knowledge operating system. It chunks documents, embeds text using SentenceTransformers, and stores vectors in ChromaDB for fast similarity retrieval."
    chunks = chunker.chunk_text(sample_text)
    assert len(chunks) >= 2
    assert chunks[0]["chunk_index"] == 0
    assert "character_count" in chunks[0]
    assert "token_count" in chunks[0]


def test_embedding_service():
    texts = ["FastAPI backend architecture", "SentenceTransformers vector embeddings"]
    vectors = embedding_service.generate_embeddings(texts)
    assert len(vectors) == 2
    assert len(vectors[0]) == 384
    assert len(vectors[1]) == 384


def test_vector_store_operations():
    test_uid = str(uuid.uuid4())
    test_doc_id = str(uuid.uuid4())
    chunks = [{
        "chunk_index": 0,
        "chunk_text": "ChromaDB vector store integration test for Vaultonaut.",
        "character_count": 54,
        "token_count": 8,
        "db_chunk_id": uuid.uuid4()
    }]
    embeddings = [[0.1] * 384]
    doc_meta = {"title": "Test Doc", "original_filename": "test.txt"}

    v_ids = vector_store_service.upsert_chunks(test_uid, test_doc_id, None, chunks, embeddings, doc_meta)
    assert len(v_ids) == 1

    # Query
    query_vec = [0.1] * 384
    results = vector_store_service.similarity_query(test_uid, query_vec, top_k=1)
    assert len(results) == 1
    assert "ChromaDB vector store integration test" in results[0]["chunk_text"]

    # Delete
    vector_store_service.delete_chunks_by_document(test_uid, test_doc_id)
    del_results = vector_store_service.similarity_query(test_uid, query_vec, top_k=1)
    assert len(del_results) == 0


def test_ai_ingestion_pipeline_end_to_end(client, auth_headers, db_session, test_user):
    content = b"# System Design\n\nVaultonaut uses FastAPI for APIs, PostgreSQL for relational storage, and ChromaDB for vector similarity indexing."
    file_tuple = ("ai_system.md", io.BytesIO(content), "text/markdown")

    res = client.post("/api/documents/upload", files={"file": file_tuple}, headers=auth_headers)
    assert res.status_code == 201
    doc_data = res.json()
    assert doc_data["status"] == "completed"

    doc_id = uuid.UUID(doc_data["id"])
    db_chunks = db_session.query(DocumentChunk).filter(DocumentChunk.document_id == doc_id).all()
    assert len(db_chunks) >= 1
    assert db_chunks[0].user_id == test_user.id

    db_embeddings = db_session.query(Embedding).join(DocumentChunk).filter(DocumentChunk.document_id == doc_id).all()
    assert len(db_embeddings) >= 1
    assert db_embeddings[0].embedding_dimension == 384


def test_similarity_search_endpoint(client, auth_headers):
    # Upload document first
    content = b"PyMuPDF extracts text from PDF documents. Python-docx parses Word documents."
    upload_res = client.post("/api/documents/upload", files={"file": ("parsing.txt", io.BytesIO(content), "text/plain")}, headers=auth_headers)
    assert upload_res.status_code == 201, f"Upload failed: {upload_res.status_code} - {upload_res.text}"

    # Search
    search_payload = {
        "query": "How are PDF files parsed?",
        "top_k": 3
    }
    response = client.post("/api/search/similarity", json=search_payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_retrieved"] >= 1
    assert len(data["results"]) >= 1
    assert "similarity_score" in data["results"][0]


def test_vector_deletion_sync(client, auth_headers, db_session):
    content = b"Temporary document content to test vector deletion synchronization."
    res = client.post("/api/documents/upload", files={"file": ("temp.txt", io.BytesIO(content), "text/plain")}, headers=auth_headers)
    doc_id = res.json()["id"]

    # Verify chunks exist
    chunks_before = db_session.query(DocumentChunk).filter(DocumentChunk.document_id == uuid.UUID(doc_id)).all()
    assert len(chunks_before) >= 1

    # Delete
    del_res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Verify chunks deleted from DB
    chunks_after = db_session.query(DocumentChunk).filter(DocumentChunk.document_id == uuid.UUID(doc_id)).all()
    assert len(chunks_after) == 0
