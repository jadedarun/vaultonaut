# Vaultonaut

Vaultonaut is an AI-powered personal knowledge management and study application. It allows users to upload documents, retrieve grounded information through Retrieval-Augmented Generation (RAG), and generate study materials.

## Features

- Document Ingestion: Support for text extraction from PDF, DOCX, and TXT files.
- Semantic Retrieval: Local dense embeddings query against ChromaDB.
- Grounded AI Conversations: Google Gemini LLM API integration with prompt injection defenses to produce grounded, source-backed replies.
- Source Citations: Interactive Source Explorer panel and transparent page/chunk citations.
- Knowledge Management: Collection categorization, thread sidebar management, and favorite/pin workflows.
- Automatic Flashcard Generation: Background generation of flashcards from uploaded documents.
- AI-Generated Quizzes: Automated creation of multiple-choice study quizzes with detailed explanations.
- Learning Studio: Frontend workspace to review flashcards, test knowledge with quizzes, and read summaries.
- User Authentication: Google OAuth 2.0 integration with JWT-based session security.
- Persistent Storage: PostgreSQL database schema for relational data and local file storage for files and vectors.
- Developer Diagnostics: Telemetry diagnostics interface, API health endpoint, and detailed local logging.

## Architecture

Vaultonaut uses a decoupled architecture with a React Single Page Application (SPA) frontend, a FastAPI REST backend, and localized data stores.

- Frontend SPA: React 19, Vite, and Vanilla CSS.
- Backend API: FastAPI (Python 3.12+), SQLAlchemy 2.0, and Alembic migrations.
- Primary Database: PostgreSQL 16.
- Vector Database: ChromaDB persistent vector database.
- Embeddings Model: sentence-transformers/all-MiniLM-L6-v2 (384-dimensional).
- LLM Provider: Google Gemini API (gemini-1.5-flash).
- Container Orchestration: Docker and Docker Compose.

## Tech Stack

- Frontend: React 19, Vite, Vanilla CSS, Lucide Icons, Framer Motion
- Backend: Python 3.12+, FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic v2, PyMuPDF, python-docx
- Databases: PostgreSQL 16, ChromaDB
- AI Integration: Google GenAI SDK, SentenceTransformers (all-MiniLM-L6-v2)
- DevOps: Docker, Docker Compose, Pytest



## Environment Variables

The application relies on environment variables for configuration. Copy the template from `.env.example` to `.env` and fill in the values:

- `GEMINI_API_KEY`: API Key for Google Gemini services.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID for user login.
- `DATABASE_URL`: PostgreSQL connection URI.
- `JWT_SECRET`: Secret key for signing JWT tokens.

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

Vaultonaut is currently under active development and is being prepared for deployment.

