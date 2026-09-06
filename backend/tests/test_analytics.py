import json
import uuid
from datetime import datetime, timedelta
from app.core.security import create_access_token
from app.models.user import User
from app.models.document import Document
from app.models.knowledge import Knowledge
from app.models.conversation import Conversation, ConversationMessage


def create_user_with_token(db_session, email: str, google_id: str):
    user = User(
        id=uuid.uuid4(),
        google_id=google_id,
        email=email,
        first_name="Analytics",
        last_name="Tester",
        email_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    token = create_access_token(user_id=user.id, email=user.email)
    headers = {"Authorization": f"Bearer {token}"}
    return user, headers


def test_analytics_empty_user(client, db_session):
    """Verifies that a user with no data receives truthful zero values and empty states."""
    user, headers = create_user_with_token(db_session, "empty_user@vaultonaut.com", "gid_empty")

    response = client.get("/api/analytics/overview", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["has_data"] is False
    assert data["time_range"] == "30d"
    assert data["overview"]["total_documents"] == 0
    assert data["overview"]["ai_ready_documents"] == 0
    assert data["overview"]["total_conversations"] == 0
    assert data["overview"]["total_questions_asked"] == 0
    assert data["overview"]["total_study_materials"] == 0
    assert data["knowledge_library"]["total_documents"] == 0
    assert len(data["knowledge_library"]["file_type_distribution"]) == 0
    assert len(data["knowledge_library"]["recent_documents"]) == 0
    assert data["learning_progress"]["quizzes_available"] == 0
    assert data["learning_progress"]["total_flashcards"] == 0
    assert data["learning_progress"]["quiz_attempts_recorded"] is False
    assert len(data["recent_activity"]) == 0


def test_analytics_populated_user_metrics(client, db_session):
    """Verifies accurate metrics computation for a user with documents, conversations, and study materials."""
    user, headers = create_user_with_token(db_session, "active_user@vaultonaut.com", "gid_active")

    # 1. Create Documents
    doc1 = Document(
        id=uuid.uuid4(),
        user_id=user.id,
        original_filename="Machine_Learning_Guide.pdf",
        stored_filename="stored_ml.pdf",
        file_extension=".pdf",
        mime_type="application/pdf",
        file_size=204800,  # 200 KB
        storage_path="/storage/ml.pdf",
        status="completed",
        checksum_sha256="abc1",
        page_count=12,
        word_count=3500,
        reading_time=15
    )
    doc2 = Document(
        id=uuid.uuid4(),
        user_id=user.id,
        original_filename="Notes.docx",
        stored_filename="stored_notes.docx",
        file_extension=".docx",
        mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        file_size=102400,  # 100 KB
        storage_path="/storage/notes.docx",
        status="completed",
        checksum_sha256="abc2",
        page_count=5,
        word_count=1200,
        reading_time=6
    )
    db_session.add_all([doc1, doc2])

    # 2. Create Study Materials (Flashcards & Quiz)
    fc_entry = Knowledge(
        id=uuid.uuid4(),
        user_id=user.id,
        title=f"Flashcards - {str(doc1.id)}",
        content=json.dumps([
            {"q": "What is Supervised Learning?", "a": "Learning with labeled data"},
            {"q": "What is Overfitting?", "a": "High variance model"}
        ]),
        category="Flashcards",
        tags=["ai", "ml"]
    )
    quiz_entry = Knowledge(
        id=uuid.uuid4(),
        user_id=user.id,
        title=f"Quiz - {str(doc1.id)}",
        content=json.dumps({
            "questions": [
                {"question": "Q1", "options": ["A", "B"], "answer_idx": 0, "explanation": "E1"},
                {"question": "Q2", "options": ["A", "B"], "answer_idx": 1, "explanation": "E2"},
                {"question": "Q3", "options": ["A", "B"], "answer_idx": 0, "explanation": "E3"}
            ]
        }),
        category="Quizzes",
        tags=["quiz"]
    )
    db_session.add_all([fc_entry, quiz_entry])

    # 3. Create Conversation and Messages with Citations
    conv = Conversation(
        id=uuid.uuid4(),
        user_id=user.id,
        title="ML Study Session"
    )
    db_session.add(conv)
    db_session.commit()

    q_msg = ConversationMessage(
        id=uuid.uuid4(),
        conversation_id=conv.id,
        role="user",
        content="Can you explain overfitting?",
        token_count=5
    )
    a_msg = ConversationMessage(
        id=uuid.uuid4(),
        conversation_id=conv.id,
        role="assistant",
        content="Overfitting occurs when a model learns noise in training data.",
        token_count=12,
        retrieval_metadata={
            "citations": [
                {
                    "filename": "Machine_Learning_Guide.pdf",
                    "document_title": "Machine Learning Guide",
                    "page_number": 3
                }
            ]
        }
    )
    db_session.add_all([q_msg, a_msg])
    db_session.commit()

    # Query analytics
    response = client.get("/api/analytics/overview?time_range=30d", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["has_data"] is True
    # Overview
    assert data["overview"]["total_documents"] == 2
    assert data["overview"]["ai_ready_documents"] == 2
    assert data["overview"]["total_conversations"] == 1
    assert data["overview"]["total_questions_asked"] == 1
    assert data["overview"]["total_study_materials"] == 2
    assert data["overview"]["flashcard_decks"] == 1
    assert data["overview"]["total_flashcards"] == 2
    assert data["overview"]["quizzes_count"] == 1
    assert data["overview"]["total_quiz_questions"] == 3

    # Knowledge Library
    assert data["knowledge_library"]["total_documents"] == 2
    assert data["knowledge_library"]["total_words"] == 4700
    assert data["knowledge_library"]["total_pages"] == 17
    assert data["knowledge_library"]["total_reading_time_mins"] == 21
    assert data["knowledge_library"]["documents_with_study_materials"] == 1
    assert len(data["knowledge_library"]["file_type_distribution"]) == 2

    # Most Studied Knowledge
    assert len(data["most_studied"]) > 0
    top_studied = data["most_studied"][0]
    assert top_studied["title"] == "Machine_Learning_Guide.pdf"
    assert top_studied["query_citations_count"] == 1
    assert top_studied["has_flashcards"] is True
    assert top_studied["has_quiz"] is True

    # Insights
    assert len(data["insights"]) > 0
    insight_categories = [ins["category"] for ins in data["insights"]]
    assert "library" in insight_categories
    assert "focus" in insight_categories

    # Recent Activity
    assert len(data["recent_activity"]) > 0


def test_analytics_strict_user_isolation(client, db_session):
    """Verifies that user data cannot leak to other users."""
    user1, headers1 = create_user_with_token(db_session, "user1@isolation.com", "g_iso_1")
    user2, headers2 = create_user_with_token(db_session, "user2@isolation.com", "g_iso_2")

    # Add document and conversation only for User 1
    doc = Document(
        id=uuid.uuid4(),
        user_id=user1.id,
        original_filename="User1_Secret.pdf",
        stored_filename="u1.pdf",
        file_extension=".pdf",
        mime_type="application/pdf",
        file_size=50000,
        storage_path="/u1.pdf",
        status="completed",
        checksum_sha256="u1hash",
        page_count=2,
        word_count=500,
        reading_time=3
    )
    conv = Conversation(
        id=uuid.uuid4(),
        user_id=user1.id,
        title="User 1 Confidential"
    )
    db_session.add_all([doc, conv])
    db_session.commit()

    # User 1 analytics
    resp1 = client.get("/api/analytics/overview", headers=headers1)
    assert resp1.status_code == 200
    assert resp1.json()["overview"]["total_documents"] == 1
    assert resp1.json()["overview"]["total_conversations"] == 1

    # User 2 analytics MUST be completely zero
    resp2 = client.get("/api/analytics/overview", headers=headers2)
    assert resp2.status_code == 200
    assert resp2.json()["overview"]["total_documents"] == 0
    assert resp2.json()["overview"]["total_conversations"] == 0
    assert resp2.json()["has_data"] is False


def test_analytics_time_filters(client, db_session):
    """Verifies that 7d, 30d, and all filters work as expected."""
    user, headers = create_user_with_token(db_session, "time_user@vaultonaut.com", "g_time")

    # Test valid filter values
    for tf in ["7d", "30d", "all"]:
        resp = client.get(f"/api/analytics/overview?time_range={tf}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["time_range"] == tf

    # Invalid filter returns 422
    invalid_resp = client.get("/api/analytics/overview?time_range=invalid_range", headers=headers)
    assert invalid_resp.status_code == 422


def test_analytics_unauthenticated(client, db_session):
    """Verifies that unauthenticated requests are rejected with 401."""
    resp = client.get("/api/analytics/overview")
    assert resp.status_code == 401
