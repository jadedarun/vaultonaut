import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class SimilaritySearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Semantic text search query")
    top_k: int = Field(default=5, ge=1, le=50, description="Maximum number of relevant chunks to retrieve")
    score_threshold: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Minimum cosine similarity score filter")
    document_id: Optional[uuid.UUID] = Field(default=None, description="Scope search to a specific document ID")
    knowledge_id: Optional[uuid.UUID] = Field(default=None, description="Scope search to a specific knowledge item ID")


class RetrievedChunkResponse(BaseModel):
    vector_id: str
    chunk_text: str
    similarity_score: float
    distance: Optional[float] = None
    metadata: Dict[str, Any]


class SimilaritySearchResponse(BaseModel):
    query: str
    total_retrieved: int
    top_k: int
    results: List[RetrievedChunkResponse]
