import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, Integer, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.knowledge import Knowledge


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    knowledge_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("knowledge.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    stored_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    file_extension: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    file_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    storage_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="uploading",
        nullable=False,
        index=True
    )
    processing_stage: Mapped[str] = mapped_column(
        String(50),
        default="uploading",
        nullable=False
    )
    checksum_sha256: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True
    )
    page_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    word_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    reading_time: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    language: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    processed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="documents")
    knowledge: Mapped[Optional["Knowledge"]] = relationship("Knowledge", foreign_keys=[knowledge_id])
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Document id={self.id} filename='{self.original_filename}' status='{self.status}'>"
