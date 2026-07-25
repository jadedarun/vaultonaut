import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Text, Integer, JSON, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Knowledge(Base):
    __tablename__ = "knowledge"

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
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="General",
        index=True
    )
    tags: Mapped[List[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )
    favorite: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True
    )
    pinned: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        nullable=False
    )
    word_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    reading_time: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="knowledge_items")

    def __repr__(self) -> str:
        return f"<Knowledge id={self.id} title='{self.title[:20]}' user_id={self.user_id}>"
