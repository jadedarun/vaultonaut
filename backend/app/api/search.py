import uuid
from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.search import (
    SimilaritySearchRequest,
    SimilaritySearchResponse,
    RetrievedChunkResponse
)
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_service

router = APIRouter(prefix="/api/search", tags=["Vector Similarity Search"])


@router.post("/similarity", response_model=SimilaritySearchResponse, status_code=status.HTTP_200_OK, summary="Execute Vector Similarity Search")
def execute_similarity_search(
    request: SimilaritySearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Performs vector embedding of text query and similarity search over ChromaDB chunks.
    Scoped strictly to the authenticated user's vectors. No LLM generation is called.
    """
    if not request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query text cannot be empty"
        )

    # 1. Generate Query Vector Embedding
    query_vector = embedding_service.generate_query_embedding(request.query)

    # 2. Execute ChromaDB Similarity Search
    raw_results = vector_store_service.similarity_query(
        user_id=str(current_user.id),
        query_embedding=query_vector,
        top_k=request.top_k,
        score_threshold=request.score_threshold,
        document_id=str(request.document_id) if request.document_id else None,
        knowledge_id=str(request.knowledge_id) if request.knowledge_id else None
    )

    formatted_results = [
        RetrievedChunkResponse(
            vector_id=r["vector_id"],
            chunk_text=r["chunk_text"],
            similarity_score=r["similarity_score"],
            distance=r.get("distance"),
            metadata=r["metadata"]
        ) for r in raw_results
    ]

    return SimilaritySearchResponse(
        query=request.query,
        total_retrieved=len(formatted_results),
        top_k=request.top_k,
        results=formatted_results
    )
