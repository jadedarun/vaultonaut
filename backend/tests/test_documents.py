import io
import uuid
import pytest
from app.models.user import User
from app.models.document import Document
from app.models.knowledge import Knowledge
from app.core.security import create_access_token


@pytest.fixture
def test_user(db_session):
    user = User(
        id=uuid.uuid4(),
        google_id="google_12345",
        email="docuser@example.com",
        full_name="Document Test User",
        email_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def second_user(db_session):
    user = User(
        id=uuid.uuid4(),
        google_id="google_67890",
        email="otheruser@example.com",
        full_name="Other User",
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


@pytest.fixture
def second_auth_headers(second_user):
    token = create_access_token(user_id=second_user.id, email=second_user.email)
    return {"Authorization": f"Bearer {token}"}


def test_upload_txt_document(client, auth_headers, db_session):
    content = b"Vaultonaut is a personal knowledge operating system built with FastAPI and React."
    file_tuple = ("notes.txt", io.BytesIO(content), "text/plain")

    response = client.post(
        "/api/documents/upload",
        files={"file": file_tuple},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["original_filename"] == "notes.txt"
    assert data["file_extension"] == ".txt"
    assert data["status"] == "completed"
    assert data["word_count"] == 12
    assert data["reading_time"] == 1
    assert data["knowledge_id"] is not None

    # Check auto-created Knowledge Vault item
    knowledge_item = db_session.query(Knowledge).filter(Knowledge.id == uuid.UUID(data["knowledge_id"])).first()
    assert knowledge_item is not None
    assert "Vaultonaut is a personal knowledge operating system" in knowledge_item.content


def test_upload_markdown_document(client, auth_headers):
    content = b"# System Design Architecture\n\nVaultonaut uses FastAPI, PostgreSQL, and React."
    file_tuple = ("arch.md", io.BytesIO(content), "text/markdown")

    response = client.post(
        "/api/documents/upload",
        files={"file": file_tuple},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["original_filename"] == "arch.md"
    assert data["file_extension"] == ".md"
    assert data["status"] == "completed"


def test_reject_unsupported_extension(client, auth_headers):
    content = b"binary_executable_data"
    file_tuple = ("malicious.exe", io.BytesIO(content), "application/octet-stream")

    response = client.post(
        "/api/documents/upload",
        files={"file": file_tuple},
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["message"]


def test_reject_empty_file(client, auth_headers):
    content = b""
    file_tuple = ("empty.txt", io.BytesIO(content), "text/plain")

    response = client.post(
        "/api/documents/upload",
        files={"file": file_tuple},
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "empty" in response.json()["message"].lower()


def test_duplicate_sha256_detection(client, auth_headers):
    content = b"Unique document content for SHA-256 duplicate testing."
    file_tuple1 = ("doc1.txt", io.BytesIO(content), "text/plain")

    res1 = client.post("/api/documents/upload", files={"file": file_tuple1}, headers=auth_headers)
    assert res1.status_code == 201

    file_tuple2 = ("doc1_copy.txt", io.BytesIO(content), "text/plain")
    res2 = client.post("/api/documents/upload", files={"file": file_tuple2}, headers=auth_headers)
    assert res2.status_code == 409
    assert "Duplicate file detected" in res2.json()["message"]


def test_batch_upload(client, auth_headers):
    file1 = ("batch1.txt", io.BytesIO(b"First batch document test text."), "text/plain")
    file2 = ("batch2.md", io.BytesIO(b"# Second Batch Document\nMore text."), "text/markdown")

    response = client.post(
        "/api/documents/upload-multiple",
        files=[("files", file1), ("files", file2)],
        headers=auth_headers
    )
    assert response.status_code == 201
    items = response.json()
    assert len(items) == 2


def test_list_and_filter_documents(client, auth_headers):
    client.post(
        "/api/documents/upload",
        files={"file": ("list_test.txt", io.BytesIO(b"List text sample content."), "text/plain")},
        headers=auth_headers
    )

    response = client.get("/api/documents", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


def test_get_document_statistics(client, auth_headers):
    response = client.get("/api/documents/statistics", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_documents" in data
    assert "total_storage_bytes" in data
    assert "file_types" in data


def test_document_download_and_security(client, auth_headers, second_auth_headers):
    content = b"Confidential personal document text."
    res_upload = client.post(
        "/api/documents/upload",
        files={"file": ("secure.txt", io.BytesIO(content), "text/plain")},
        headers=auth_headers
    )
    assert res_upload.status_code == 201
    doc_id = res_upload.json()["id"]

    # Download by owner
    res_dl = client.get(f"/api/documents/{doc_id}/download", headers=auth_headers)
    assert res_dl.status_code == 200
    assert res_dl.content == content

    # Download attempt by second user must be forbidden (403)
    res_forbidden = client.get(f"/api/documents/{doc_id}/download", headers=second_auth_headers)
    assert res_forbidden.status_code == 403


def test_delete_document(client, auth_headers):
    res_upload = client.post(
        "/api/documents/upload",
        files={"file": ("to_delete.txt", io.BytesIO(b"Delete me please."), "text/plain")},
        headers=auth_headers
    )
    doc_id = res_upload.json()["id"]

    res_del = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True

    # Confirm deleted
    res_get = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert res_get.status_code == 404
