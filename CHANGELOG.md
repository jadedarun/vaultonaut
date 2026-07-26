# Changelog

All notable changes to the Vaultonaut Personal Knowledge Operating System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-07-26

### Milestone 6: AI Workspace & Grounded RAG Engine Complete
#### Added
- **Grounded RAG Pipeline**: Integrated Google Gemini LLM provider with `sentence-transformers/all-MiniLM-L6-v2` dense embeddings and ChromaDB vector store.
- **3-Column AI Workspace**: Production-grade conversational AI interface with thread sidebar, chat trajectory, and interactive Source Explorer.
- **Rich AI Response Rendering**: Markdown parser, syntax-highlighted code blocks with Copy Code buttons, responsive tables, blockquotes, and lists.
- **Interactive Source Explorer Panel**: Deep citation inspection showing document title, category, similarity %, chunk index, text match search, and developer vector metadata.
- **Advanced Conversational UX**: Stop Generation button (`AbortController`), prompt draft saving per thread, stage-based thinking indicators, Jump to Bottom scroll control, and production toast notifications.
- **AI Settings & Diagnostics Hub (`/settings/ai`)**: Telemetry usage cards, Developer Mode inspector, service health diagnostics (`/health/detailed`), and keyboard shortcut reference guide.
- **Production Hardening**: Rate limiting middleware (200 req/min), structured JSON logging (`X-Correlation-ID`), prompt injection defenses, and composite database indexing (`idx_conversations_user_updated` and `idx_messages_conv_created`).
- **Comprehensive Test Suite**: Expanded backend pytest suite to 42 passing test cases (100% pass rate).

### Milestone 5: AI Foundation Layer
#### Added
- `document_chunks` and `embeddings` SQLAlchemy models & Alembic migration.
- `ChunkingService` (800-char window, 150-char overlap).
- `EmbeddingService` (`all-MiniLM-L6-v2` 384-dimensional vectors).
- `VectorStoreService` (ChromaDB persistent store at `storage/chroma_db`).
- Similarity search REST endpoint `POST /api/search/similarity`.

### Milestone 4: Document Ingestion Pipeline
#### Added
- PyMuPDF, docx, and txt text extraction service.
- Document processing background workers.

### Milestone 3: Knowledge Vault
#### Added
- Document and Collection models & CRUD REST endpoints.

### Milestone 2: Authentication System
#### Added
- Google OAuth 2.0 and JWT token authentication middleware.

### Milestone 1: Backend Foundation
#### Added
- FastAPI application scaffolding, SQLAlchemy base models, Alembic migration chain, and PostgreSQL integration.
