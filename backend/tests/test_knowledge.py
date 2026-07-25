import uuid
from app.core.security import create_access_token
from app.models.user import User


def create_test_user(db_session, email: str, google_id: str) -> Tuple[User, dict]:
    user = User(
        id=uuid.uuid4(),
        google_id=google_id,
        email=email,
        first_name="Test",
        last_name="User",
        email_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    token = create_access_token(user_id=user.id, email=user.email)
    headers = {"Authorization": f"Bearer {token}"}
    return user, headers


from typing import Tuple


def test_create_knowledge(client, db_session):
    _, headers = create_test_user(db_session, "user1@vaultonaut.com", "g1")

    payload = {
        "title": "System Design Architecture",
        "content": "This document outlines microservices and event-driven architecture using FastAPI and PostgreSQL.",
        "category": "Architecture",
        "tags": ["system-design", "fastapi"],
        "favorite": True,
        "pinned": False
    }

    response = client.post("/api/knowledge", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "System Design Architecture"
    assert data["word_count"] == 11
    assert data["reading_time"] == 1
    assert data["category"] == "Architecture"
    assert "system-design" in data["tags"]
    assert data["favorite"] is True


def test_get_user_knowledge_list(client, db_session):
    user, headers = create_test_user(db_session, "user2@vaultonaut.com", "g2")

    # Create 2 documents
    client.post("/api/knowledge", json={"title": "Doc 1", "content": "Content 1", "category": "CS-101"}, headers=headers)
    client.post("/api/knowledge", json={"title": "Doc 2", "content": "Content 2", "category": "AI"}, headers=headers)

    # Get list
    response = client.get("/api/knowledge?page=1&page_size=10", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2

    # Filter by category
    res_filtered = client.get("/api/knowledge?category=CS-101", headers=headers)
    assert res_filtered.status_code == 200
    assert res_filtered.json()["total"] == 1
    assert res_filtered.json()["items"][0]["title"] == "Doc 1"

    # Search query
    res_search = client.get("/api/knowledge?query=Doc 2", headers=headers)
    assert res_search.status_code == 200
    assert res_search.json()["total"] == 1
    assert res_search.json()["items"][0]["title"] == "Doc 2"


def test_ownership_isolation_security(client, db_session):
    # User A creates a document
    _, headers_a = create_test_user(db_session, "usera@vaultonaut.com", "ga")
    create_res = client.post("/api/knowledge", json={"title": "Private User A Doc", "content": "Secret data"}, headers=headers_a)
    doc_id = create_res.json()["id"]

    # User B attempts to access User A's document
    _, headers_b = create_test_user(db_session, "userb@vaultonaut.com", "gb")
    get_res = client.get(f"/api/knowledge/{doc_id}", headers=headers_b)
    assert get_res.status_code == 404

    # User B attempts to update User A's document
    update_res = client.put(f"/api/knowledge/{doc_id}", json={"title": "Hacked Title"}, headers=headers_b)
    assert update_res.status_code == 404

    # User B attempts to delete User A's document
    delete_res = client.delete(f"/api/knowledge/{doc_id}", headers=headers_b)
    assert delete_res.status_code == 404


def test_update_and_delete_knowledge(client, db_session):
    _, headers = create_test_user(db_session, "user3@vaultonaut.com", "g3")
    create_res = client.post("/api/knowledge", json={"title": "Initial", "content": "Word1 Word2"}, headers=headers)
    doc_id = create_res.json()["id"]

    # Update
    update_res = client.put(f"/api/knowledge/{doc_id}", json={"title": "Updated Title", "content": "Word1 Word2 Word3 Word4"}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Title"
    assert update_res.json()["word_count"] == 4

    # Delete
    delete_res = client.delete(f"/api/knowledge/{doc_id}", headers=headers)
    assert delete_res.status_code == 200

    # Get should now return 404
    get_res = client.get(f"/api/knowledge/{doc_id}", headers=headers)
    assert get_res.status_code == 404


def test_toggle_favorite_and_pin(client, db_session):
    _, headers = create_test_user(db_session, "user4@vaultonaut.com", "g4")
    create_res = client.post("/api/knowledge", json={"title": "Toggle Doc", "content": "Testing toggles"}, headers=headers)
    doc_id = create_res.json()["id"]

    # Toggle favorite
    fav_res = client.patch(f"/api/knowledge/{doc_id}/favorite", headers=headers)
    assert fav_res.status_code == 200
    assert fav_res.json()["favorite"] is True

    # Toggle pin
    pin_res = client.patch(f"/api/knowledge/{doc_id}/pin", headers=headers)
    assert pin_res.status_code == 200
    assert pin_res.json()["pinned"] is True


def test_validation_empty_content(client, db_session):
    _, headers = create_test_user(db_session, "user5@vaultonaut.com", "g5")
    res = client.post("/api/knowledge", json={"title": "", "content": ""}, headers=headers)
    assert res.status_code == 422
