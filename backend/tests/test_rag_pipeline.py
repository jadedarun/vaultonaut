import io
import uuid
import pytest
from app.models.user import User
from app.models.conversation import Conversation, ConversationMessage
from app.core.security import create_access_token
from app.services.rag.providers.factory import LLMProviderFactory
from app.services.rag.context_builder import context_builder_service
from app.services.rag.prompt_builder import prompt_builder_service
from app.services.rag.citation_service import citation_service
from app.services.rag import conversation_service
from app.services.rag.rag_service import NO_CONTEXT_REFUSAL


@pytest.fixture
def test_user(db_session):
    user = User(
        id=uuid.uuid4(),
        google_id="google_rag_123",
        email="raguser@example.com",
        full_name="RAG Pipeline Test User",
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


def test_llm_provider_factory():
    provider = LLMProviderFactory.get_provider("gemini")
    assert provider is not None
    assert provider.provider_name == "Google Gemini"


def test_context_builder():
    chunks = [
        {
            "chunk_text": "Vaultonaut uses FastAPI and SQLAlchemy for high performance APIs.",
            "similarity_score": 0.89,
            "metadata": {"title": "Architecture Overview", "original_filename": "arch.md", "chunk_index": 0}
        },
        {
            "chunk_text": "ChromaDB stores 384-dimensional dense vectors locally.",
            "similarity_score": 0.82,
            "metadata": {"title": "Vector Config", "original_filename": "chroma.txt", "chunk_index": 1}
        }
    ]
    context_str, citations = context_builder_service.format_context(chunks)
    assert "Vaultonaut uses FastAPI" in context_str
    assert len(citations) == 2
    assert citations[0]["similarity_score"] == 0.89


def test_prompt_builder_grounding_and_defense():
    system_prompt = prompt_builder_service.build_system_prompt()
    assert "Base your answer STRICTLY on the provided context" in system_prompt
    assert "PROMPT INJECTION DEFENSE" in system_prompt

    prompt = prompt_builder_service.build_rag_prompt(
        user_question="What vector store is used?",
        context_str="Vaultonaut uses ChromaDB for vector storage.",
        history=[]
    )
    assert "What vector store is used?" in prompt
    assert "Vaultonaut uses ChromaDB" in prompt


def test_citation_service():
    raw_citations = [{
        "source_num": 1,
        "document_title": "FastAPI Guide",
        "filename": "fastapi.md",
        "category": "Documentation",
        "chunk_index": 0,
        "similarity_score": 0.91234,
        "snippet": "FastAPI dependency injection pattern."
    }]
    formatted = citation_service.format_citations(raw_citations)
    assert len(formatted) == 1
    assert formatted[0]["similarity_score"] == 0.9123


def test_conversation_service(db_session, test_user):
    # Create conversation
    conv = conversation_service.create_conversation(db_session, test_user.id, title="Test Chat Thread")
    assert conv.id is not None
    assert conv.title == "Test Chat Thread"

    # Add message
    msg = conversation_service.add_message(db_session, conv.id, "user", "How does chunking work?")
    assert msg.role == "user"

    # Fetch history
    history = conversation_service.get_user_conversations(db_session, test_user.id)
    assert len(history) >= 1

    # Rename
    renamed = conversation_service.rename_conversation(db_session, conv.id, test_user.id, "Renamed Thread")
    assert renamed.title == "Renamed Thread"

    # Delete
    deleted = conversation_service.delete_conversation(db_session, conv.id, test_user.id)
    assert deleted is True


def test_rag_grounded_refusal_when_no_context(client, auth_headers):
    # Ask question with no documents uploaded
    chat_payload = {
        "query": "What is the secret launch code for the space shuttle?",
        "similarity_threshold": 0.85
    }
    res = client.post("/api/chat", json=chat_payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["grounded"] is False
    assert data["content"] == NO_CONTEXT_REFUSAL
    assert data["retrieved_count"] == 0


def test_chat_rest_endpoints(client, auth_headers):
    # Create thread
    new_res = client.post("/api/chat/new", headers=auth_headers)
    assert new_res.status_code == 201
    conv_id = new_res.json()["id"]

    # History list
    hist_res = client.get("/api/chat/history", headers=auth_headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1

    # Get conversation details
    detail_res = client.get(f"/api/chat/{conv_id}", headers=auth_headers)
    assert detail_res.status_code == 200

    # Delete conversation
    del_res = client.delete(f"/api/chat/{conv_id}", headers=auth_headers)
    assert del_res.status_code == 200
