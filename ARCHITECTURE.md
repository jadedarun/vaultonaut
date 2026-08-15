# Vaultonaut Technical Architecture Specification

Vaultonaut is an AI-powered Personal Knowledge Operating System built using a grounded Retrieval-Augmented Generation (RAG) architecture, FastAPI backend, PostgreSQL database, ChromaDB vector store, Google Gemini LLM, and React 19 SPA frontend.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Client[React 19 Vite Frontend SPA] -->|HTTPS / REST API| API[FastAPI Backend Server :8000]
    API -->|JWT Authentication| Auth[OAuth2 / JWT Security Layer]
    API -->|SQLAlchemy ORM| DB[(PostgreSQL 16 Database)]
    API -->|Vector Similarity Query| VectorStore[(ChromaDB Vector Store)]
    API -->|Prompt & Context Payload| LLM[Google Gemini LLM Service]
    VectorStore -->|384d Dense Vectors| Embed[SentenceTransformers all-MiniLM-L6-v2]
```

---

## 2. Grounded RAG Pipeline Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React AI Workspace
    participant API as FastAPI Backend
    participant VectorDB as ChromaDB Vector Store
    participant Gemini as Google Gemini API
    participant DB as PostgreSQL DB

    User->>Frontend: Type Prompt Question
    Frontend->>API: POST /api/chat {query, conversation_id}
    API->>VectorDB: Query Similarity (all-MiniLM-L6-v2 384d, top_k=5)
    VectorDB-->>API: Return Top-K Chunks + Similarity Scores
    
    alt Similarity Score < 0.45 Cutoff
        API-->>Frontend: Grounded Refusal ("I couldn't find enough information...")
    else Similarity Score >= 0.45 Cutoff
        API->>Gemini: Generate Content (System Grounding Prompt + Chunks + Query)
        Gemini-->>API: Return Grounded Response Text
        API->>DB: Save User & Assistant Messages to History
        API-->>Frontend: Return Response + Source Citations Metadata
    end

    Frontend-->>User: Render Response + Markdown + Interactive Source Cards
```

---

## 3. Database Schema Overview

```
users (id, google_id, email, full_name, is_active, created_at)
  └── knowledge (id, user_id, title, content, category, created_at)
  └── documents (id, user_id, filename, file_path, mime_type, file_size, processed_at)
        └── document_chunks (id, document_id, chunk_index, chunk_text, token_count)
              └── embeddings (id, chunk_id, vector_id, embedding_model, dimensions)
  └── conversations (id, user_id, title, created_at, updated_at)
        └── conversation_messages (id, conversation_id, role, content, retrieval_metadata, created_at)
```
