# Vaultonaut Backend API – Milestone 1: Backend Foundation

Production-ready FastAPI backend foundation for **Vaultonaut** – AI-Powered Personal Knowledge Vault.

---

## 🛠️ Software & Prerequisites

Ensure the following tools are installed on your machine:
* **Python 3.12+** (or Python 3.10+)
* **PostgreSQL Server 16+** (or Docker with PostgreSQL container)
* **Git**

---

## 🚀 Quick Start Guide

### 1. Environment Setup

Navigate to the `backend/` folder and create a Python virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

* **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

### 2. Install Dependencies

Install all required Python packages:

```bash
pip install -r requirements.txt
```

---

## 🗄️ PostgreSQL Setup & Database Migrations

### Option A: Running PostgreSQL via Docker (Recommended)

If you have Docker installed, start a PostgreSQL container with one command:

```bash
docker run --name vaultonaut-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vaultonaut_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Option B: Local PostgreSQL Server

Create a PostgreSQL database named `vaultonaut_db` via `psql` or pgAdmin:

```sql
CREATE DATABASE vaultonaut_db;
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update your `.env` settings if needed:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vaultonaut_db
JWT_SECRET=super-secret-key-change-this-in-production-vaultonaut-2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GOOGLE_CLIENT_ID=1049489293832-ool2v684u0df5a34cc1jnjeg3t2mv35u.apps.googleusercontent.com
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 🔄 Run Alembic Database Migrations

Apply the database schema to PostgreSQL:

```bash
alembic upgrade head
```

---

## 🏃 Running the Backend Server

Start the Uvicorn development server:

```bash
uvicorn main:app --reload --port 8000
```

The API will start at: `http://localhost:8000`

---

## 📖 Swagger API Documentation

Open your browser and navigate to:
* **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Running Automated Tests

Run the full pytest suite:

```bash
pytest -v
```

All health check, authentication, JWT token, and user endpoints are tested with isolated test sessions.

---

## 📌 Main API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | No | Health check endpoint |
| `POST` | `/auth/google` | No | Google token exchange for backend JWT + User profile |
| `POST` | `/auth/logout` | No | Standardized response for logout |
| `GET` | `/users/me` | **Yes (JWT Bearer)** | Get profile of logged-in user |

---

## 🔒 Security Best Practices Implemented

* **Strict Dependency Injection:** SQLAlchemy sessions and JWT authentication context are injected via `Depends()`.
* **Standardized JSON Error Handlers:** Clean, consistent `{ "success": false, "message": "..." }` responses for all validation and HTTP exceptions.
* **SQL Injection Prevention:** 100% parameterization using SQLAlchemy 2.0 ORM Mapped models.
* **Secure CORS Configuration:** Restricted to configured frontend origin (`http://localhost:5173`).
