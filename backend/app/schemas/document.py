import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    knowledge_id: Optional[uuid.UUID] = None
    original_filename: str
    stored_filename: str
    file_extension: str
    mime_type: str
    file_size: int
    status: str
    processing_stage: str
    checksum_sha256: str
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    reading_time: Optional[int] = None
    language: Optional[str] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    items: List[DocumentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DocumentStatusResponse(BaseModel):
    id: uuid.UUID
    original_filename: str
    status: str
    processing_stage: str
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    processed_at: Optional[datetime] = None


class DocumentStatisticsResponse(BaseModel):
    total_documents: int
    completed_count: int
    failed_count: int
    processing_count: int
    total_storage_bytes: int
    total_storage_mb: float
    file_types: Dict[str, int]
