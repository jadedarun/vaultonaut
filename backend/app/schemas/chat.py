import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User prompt / question for Vaultonaut AI")
    conversation_id: Optional[uuid.UUID] = Field(default=None, description="Existing conversation thread ID")
    top_k: Optional[int] = Field(default=5, ge=1, le=50, description="ChromaDB top-K chunks to retrieve")
    similarity_threshold: Optional[float] = Field(default=0.75, ge=0.0, le=1.0, description="Minimum similarity score filter")


class CitationItem(BaseModel):
    source_num: int
    document_title: str
    filename: str
    category: str
    chunk_index: int
    similarity_score: float
    vector_id: Optional[str] = None
    snippet: str


class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    conversation_title: str
    user_message_id: uuid.UUID
    message_id: uuid.UUID
    role: str
    content: str
    grounded: bool
    retrieved_count: int
    citations: List[CitationItem]
    model_name: str
    latency_ms: Dict[str, Any]


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime


class ConversationMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    token_count: int
    retrieval_metadata: Dict[str, Any]
    created_at: datetime


class ConversationDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ConversationMessageResponse]


class RenameConversationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="New conversation title")
