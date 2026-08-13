import shutil
import psutil
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.config.settings import settings
from app.services.vector_store import vector_store_service

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {"status": "healthy"}

@router.get("/health/detailed")
def detailed_health_check(db: Session = Depends(get_db)):
    # 1. Database Check
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # 2. ChromaDB Check
    chroma_status = "healthy"
    try:
        if vector_store_service.is_available:
            vector_store_service.collection.count()
        else:
            chroma_status = "unhealthy: ChromaDB collection is not initialized"
    except Exception as e:
        chroma_status = f"unhealthy: {str(e)}"

    # 3. Gemini API Check
    gemini_status = "configured" if settings.GEMINI_API_KEY else "unconfigured"

    # 4. System Resources (Disk & Memory)
    total, used, free = shutil.disk_usage("/")
    disk_percent = round((used / total) * 100, 1)
    memory_percent = psutil.virtual_memory().percent

    return {
        "status": "healthy" if db_status == "healthy" and chroma_status == "healthy" else "degraded",
        "service": "Vaultonaut AI Engine",
        "version": "1.0.0",
        "diagnostics": {
            "postgresql": db_status,
            "chromadb": chroma_status,
            "gemini_api": gemini_status,
            "disk_usage_percent": disk_percent,
            "memory_usage_percent": memory_percent
        }
    }


@router.get("/api/settings")
def get_backend_settings():
    """Exposes backend authoritative configuration defaults (loaded from .env)."""
    return {
        "gemini_model": settings.GEMINI_MODEL,
        "rag_top_k": settings.RAG_TOP_K,
        "rag_similarity_threshold": settings.RAG_SIMILARITY_THRESHOLD,
        "environment": settings.ENVIRONMENT
    }
