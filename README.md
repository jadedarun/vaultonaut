# Vaultonaut

Vaultonaut repository containing the React frontend and FastAPI backend.

## Project Structure

- `src/` - React frontend application (Vite, TailwindCSS, React OAuth)
- `backend/` - FastAPI backend application (PostgreSQL, SQLAlchemy, Alembic, JWT Authentication)


### 1. Frontend Setup

Install Node dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

The frontend will run on http://localhost:5173

### 2. Backend Setup

See [backend/README.md](backend/README.md) for detailed backend setup and database configuration instructions.

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000
```

The backend API will run on http://localhost:8000
