import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.conversation import ConversationMessage
from app.core.security import get_current_user
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
    ConversationDetailResponse,
    RenameConversationRequest
)
from app.services.rag.rag_service import rag_service
from app.services.rag import conversation_service

router = APIRouter(prefix="/api/chat", tags=["AI Grounded Chat & RAG"])


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK, summary="Send Q&A Prompt to Grounded RAG Assistant")
def chat_with_knowledge(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes grounded Retrieval-Augmented Generation (RAG) using Google Gemini.
    Answers strictly using retrieved knowledge vault chunks.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query prompt cannot be empty or whitespace only."
        )

    return rag_service.answer_question(
        db=db,
        user_id=current_user.id,
        query=request.query.strip(),
        conversation_id=request.conversation_id,
        top_k=request.top_k,
        similarity_threshold=request.similarity_threshold
    )


@router.post("/new", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED, summary="Create New Conversation Thread")
def create_new_conversation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new empty conversation session.
    """
    return conversation_service.create_conversation(db, current_user.id)


@router.get("/history", response_model=List[ConversationResponse], summary="List User Conversation Threads")
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns list of conversation threads owned by user.
    """
    return conversation_service.get_user_conversations(db, current_user.id)


@router.get("/{conversation_id}", response_model=ConversationDetailResponse, summary="Get Full Conversation Message History")
def get_conversation_detail(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full message history for a specific conversation thread.
    """
    return conversation_service.get_conversation_by_id(db, conversation_id, current_user.id)


@router.patch("/{conversation_id}", response_model=ConversationResponse, summary="Rename Conversation Thread")
def rename_conversation(
    conversation_id: uuid.UUID,
    request: RenameConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Renames an existing conversation thread.
    """
    return conversation_service.rename_conversation(db, conversation_id, current_user.id, request.title)


@router.delete("/{conversation_id}", status_code=status.HTTP_200_OK, summary="Delete Conversation Thread")
def delete_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes conversation thread and all messages.
    """
    conversation_service.delete_conversation(db, conversation_id, current_user.id)
    return {"success": True, "message": "Conversation deleted successfully"}


@router.get("/sources/{message_id}", summary="Get Message Source Citations")
def get_message_sources(
    message_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves source citations and vector chunk metadata for a specific assistant message.
    """
    msg = db.query(ConversationMessage).filter(ConversationMessage.id == message_id).first()
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    # Check conversation ownership
    conversation_service.get_conversation_by_id(db, msg.conversation_id, current_user.id)
    
    return {
        "message_id": msg.id,
        "citations": msg.retrieval_metadata.get("citations", []),
        "retrieved_count": msg.retrieval_metadata.get("retrieved_count", 0),
        "model_name": msg.retrieval_metadata.get("model_name")
    }
