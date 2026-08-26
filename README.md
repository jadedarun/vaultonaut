# Vaultonaut

Vaultonaut is an AI-powered personal knowledge management and grounded document intelligence application.

## Features

- Document ingestion
- AI-powered document conversations
- Grounded retrieval
- Source citations
- Knowledge management
- Automatic flashcard generation
- AI-generated quizzes
- Learning Studio
- Authentication
- Persistent storage
- Developer diagnostics

## Architecture

Frontend
→ FastAPI backend
→ PostgreSQL
→ ChromaDB
→ SentenceTransformer embeddings
→ Gemini

## Tech Stack

- Frontend: React 19, Vite, Vanilla CSS, Lucide Icons, Framer Motion
- Backend: Python 3.12+, FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic v2, PyMuPDF, python-docx
- Databases: PostgreSQL 16, ChromaDB
- AI Integration: Google GenAI SDK, SentenceTransformers (all-MiniLM-L6-v2)
- DevOps: Docker, Docker Compose, Pytest



## Project Structure

```
vaultonaut/
 ├── backend/
 │    ├── alembic/                 (Database migrations)
 │    ├── app/
 │    │    ├── api/                (FastAPI routers: chat, documents, auth, etc.)
 │    │    ├── config/             (Application settings)
 │    │    ├── core/               (Logging and security core)
 │    │    ├── models/             (SQLAlchemy database models)
 │    │    ├── schemas/            (Pydantic validation schemas)
 │    │    └── services/           (RAG engine, embedding, and factory services)
 │    ├── tests/                   (Pytest backend suite)
 │    ├── Dockerfile               (Backend production image config)
 │    └── main.py                  (FastAPI entrypoint)
 ├── src/
 │    ├── components/              (React components: workspace, settings, etc.)
 │    ├── context/                 (React context state providers)
 │    ├── hooks/                   (Custom React hooks)
 │    ├── services/                (API service integrations)
 │    └── App.jsx                  (Main application workspace)
 ├── docker-compose.yml            (Docker multi-service orchestration)
 ├── Dockerfile                    (Frontend production NGINX image config)
 ├── ARCHITECTURE.md               (Technical system architecture specification)
 ├── CHANGELOG.md                  (Semantic versioning changelog)
 ├── CONTRIBUTING.md               (Developer contribution guidelines)
 └── LICENSE                       (MIT License)
```

## Status

Vaultonaut is under active development and is being prepared for deployment.
