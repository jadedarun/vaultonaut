import uuid
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.conversation import Conversation, ConversationMessage


def create_conversation(db: Session, user_id: uuid.UUID, title: str = "New Conversation") -> Conversation:
    """Creates a new conversation thread for user."""
    conv = Conversation(
        id=uuid.uuid4(),
        user_id=user_id,
        title=title[:255]
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def get_user_conversations(db: Session, user_id: uuid.UUID) -> List[Conversation]:
    """Lists all conversation threads owned by user."""
    return db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc()).all()


def get_conversation_by_id(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> Conversation:
    """Gets single conversation thread owned by user or raises 404/403."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation thread not found"
        )
    if conv.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not own this conversation"
        )
    return conv


def rename_conversation(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID, new_title: str) -> Conversation:
    """Renames conversation title."""
    conv = get_conversation_by_id(db, conversation_id, user_id)
    conv.title = new_title.strip()[:255]
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conv)
    return conv


def delete_conversation(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    """Deletes conversation thread and all messages."""
    conv = get_conversation_by_id(db, conversation_id, user_id)
    db.delete(conv)
    db.commit()
    return True


def add_message(
    db: Session,
    conversation_id: uuid.UUID,
    role: str,
    content: str,
    retrieval_metadata: Optional[Dict[str, Any]] = None
) -> ConversationMessage:
    """Appends user or assistant message to conversation thread."""
    msg = ConversationMessage(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        role=role,
        content=content,
        token_count=len(content.split()),
        retrieval_metadata=retrieval_metadata or {}
    )
    db.add(msg)
    
    # Touch conversation updated_at
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv:
        conv.updated_at = datetime.utcnow()
        # Auto-title if title is default "New Conversation" and role is "user"
        if conv.title in ("New Conversation", "Untitled") and role == "user":
            conv.title = content.strip()[:40] + ("..." if len(content.strip()) > 40 else "")

    db.commit()
    db.refresh(msg)
    return msg
