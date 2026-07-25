import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class KnowledgeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Document title")
    content: str = Field(..., min_length=1, description="Document content text")
    category: str = Field(default="General", max_length=100, description="Category name")
    tags: List[str] = Field(default_factory=list, description="List of tag strings")
    favorite: bool = Field(default=False, description="Favorite flag")
    pinned: bool = Field(default=False, description="Pinned flag")


class KnowledgeCreate(KnowledgeBase):
    summary: Optional[str] = Field(default=None, description="Optional document summary")


class KnowledgeUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = Field(default=None, min_length=1)
    summary: Optional[str] = Field(default=None)
    category: Optional[str] = Field(default=None, max_length=100)
    tags: Optional[List[str]] = Field(default=None)
    favorite: Optional[bool] = Field(default=None)
    pinned: Optional[bool] = Field(default=None)
    status: Optional[str] = Field(default=None, max_length=50)


class KnowledgeResponse(KnowledgeBase):
    id: uuid.UUID
    user_id: uuid.UUID
    summary: Optional[str] = None
    status: str
    word_count: int
    reading_time: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KnowledgeListResponse(BaseModel):
    items: List[KnowledgeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
