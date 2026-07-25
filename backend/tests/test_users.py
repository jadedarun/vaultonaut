import uuid
from app.core.security import create_access_token
from app.models.user import User


def test_get_me_unauthorized(client):
    response = client.get("/users/me")
    assert response.status_code == 403 or response.status_code == 401


def test_get_me_success(client, db_session):
    # 1. Create a user in test DB
    test_user = User(
        id=uuid.uuid4(),
        google_id="google-id-test-me",
        email="me@vaultonaut.com",
        first_name="Vault",
        last_name="User",
        full_name="Vault User",
        email_verified=True,
        is_active=True
    )
    db_session.add(test_user)
    db_session.commit()

    # 2. Create valid JWT token
    token = create_access_token(user_id=test_user.id, email=test_user.email)

    # 3. Call GET /users/me with Authorization header
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/users/me", headers=headers)
    
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "me@vaultonaut.com"
    assert user_data["google_id"] == "google-id-test-me"
