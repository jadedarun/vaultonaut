import uuid
from datetime import datetime
from typing import Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, DateTime, Text, Integer, JSON, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.knowledge import Knowledge
    from app.models.user import User
    from app.models.embedding import Embedding


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    knowledge_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("knowledge.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True
    )
    chunk_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    token_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    character_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=dict,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
    knowledge: Mapped[Optional["Knowledge"]] = relationship("Knowledge", back_populates="chunks")
    user: Mapped["User"] = relationship("User", back_populates="chunks")
    embedding: Mapped[Optional["Embedding"]] = relationship("Embedding", back_populates="chunk", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<DocumentChunk id={self.id} doc={self.document_id} idx={self.chunk_index}>"
