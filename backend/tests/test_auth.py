from unittest.mock import patch


def test_google_login_missing_token(client):
    response = client.post("/auth/google", json={})
    assert response.status_code == 400
    assert response.json()["success"] is False
    assert "credential or access_token" in response.json()["message"]


@patch("app.services.auth_service.AuthService.verify_google_token")
def test_google_login_success(mock_verify_token, client):
    mock_verify_token.return_value = {
        "sub": "google-test-uid-12345",
        "email": "testuser@gmail.com",
        "given_name": "Test",
        "family_name": "User",
        "name": "Test User",
        "picture": "https://example.com/avatar.jpg",
        "email_verified": True
    }

    response = client.post("/auth/google", json={"credential": "mock_valid_token"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "testuser@gmail.com"
    assert data["user"]["google_id"] == "google-test-uid-12345"


def test_logout_endpoint(client):
    response = client.post("/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"success": True, "message": "Logged out successfully"}


def test_demo_login_success(client):
    response = client.post("/auth/demo")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "arun@gmail.com"
    assert data["user"]["google_id"] == "google-uid-demo-12345"
