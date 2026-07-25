# Vaultonaut Backend

FastAPI backend service for Vaultonaut.

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
JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GOOGLE_CLIENT_ID=your_google_client_id
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

## Running Tests

Run the test suite with pytest:

```bash
pytest -v
```

## API Endpoints

- GET /health - Check server status
- POST /auth/google - Authenticate using Google OAuth token and return JWT
- POST /auth/logout - Logout user session
- GET /users/me - Get active user details (Requires Authorization header: Bearer <token>)
