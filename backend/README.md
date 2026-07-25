# Vaultonaut Backend

FastAPI backend service for Vaultonaut featuring Google OAuth 2.0 verification, PostgreSQL persistence, and JWT authentication.

## Prerequisites

- Python 3.10+
- PostgreSQL 16+ (or Docker)
- Git

## Setup

1. Create and activate a virtual environment:

```bash
cd backend
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Linux / macOS
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables:

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the appropriate database URL and secrets in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vaultonaut_db
JWT_SECRET=super-secret-key-change-this-in-production-vaultonaut-2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GOOGLE_CLIENT_ID=1049489293832-ool2v684u0df5a34cc1jnjeg3t2mv35u.apps.googleusercontent.com
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Database Migrations

Run database migrations using Alembic:

```bash
alembic upgrade head
```

## Running the API Server

Start the development server:

```bash
uvicorn main:app --reload --port 8000
```

API base URL: http://localhost:8000
Swagger documentation: http://localhost:8000/docs

## Authentication Architecture & Google OAuth Flow

1. Frontend initiates Google Sign-In using `@react-oauth/google` and obtains a Google OAuth token.
2. Frontend sends token to `POST /auth/google`.
3. Backend verifies the token with Google servers:
   - Validates audience (`aud`) matches `GOOGLE_CLIENT_ID`.
   - Validates issuer (`iss`) is `accounts.google.com` or `https://accounts.google.com`.
   - Validates expiration (`exp`) and `email_verified` status.
4. Database User Sync:
   - New user: Creates record in PostgreSQL `users` table.
   - Existing user: Updates name, profile picture, and `last_login` timestamp.
5. Backend generates signed JWT containing `sub` (user_id), `user_id`, `email`, `name`, `exp`, and `iat`.
6. Frontend saves JWT in `localStorage` via `tokenStorage` and attaches `Authorization: Bearer <token>` on all requests via Axios interceptors.

## JWT Lifecycle

- Token Generation: Issued upon successful Google authentication via `POST /auth/google`.
- Token Verification: Verified on every protected request (`GET /users/me`) via `get_current_user` dependency in FastAPI.
- Session Restoration: On page refresh, frontend sends stored JWT to `GET /users/me` to restore active user session.
- Expiration & Rejection: If JWT is expired or invalid, backend returns 401 Unauthorized, triggering frontend session clearance.

## Running Tests

Run the test suite with pytest:

```bash
pytest -v
```

All health check, authentication, JWT token, and user endpoints are tested with isolated test sessions.

## API Endpoints

- GET /health - Check server status
- POST /auth/google - Authenticate using Google OAuth token and return JWT
- POST /auth/logout - Logout user session
- GET /users/me - Get active user details (Requires Authorization header: Bearer <token>)
