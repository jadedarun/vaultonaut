import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.knowledge import (
    KnowledgeCreate,
    KnowledgeUpdate,
    KnowledgeResponse,
    KnowledgeListResponse
)
from app.services import knowledge_service

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Vault"])


@router.post("", response_model=KnowledgeResponse, status_code=status.HTTP_201_CREATED, summary="Create Knowledge Document")
def create_knowledge(
    data: KnowledgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new knowledge document for the current authenticated user.
    """
    return knowledge_service.create_knowledge(db, current_user.id, data)


@router.get("", response_model=KnowledgeListResponse, summary="Get Authenticated User Knowledge List")
def get_user_knowledge(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    sort: str = Query(default="created_at", description="Sort field (created_at, updated_at, title, word_count)"),
    order: str = Query(default="desc", description="Sort order (asc, desc)"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    favorite: Optional[bool] = Query(default=None, description="Filter by favorite flag"),
    pinned: Optional[bool] = Query(default=None, description="Filter by pinned flag"),
    query: Optional[str] = Query(default=None, description="Search query string"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a paginated, filterable, sortable list of knowledge documents owned by the current user.
    """
    items, total, total_pages = knowledge_service.get_user_knowledge_list(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        sort=sort,
        order=order,
        category=category,
        favorite=favorite,
        pinned=pinned,
        query=query
    )
    return KnowledgeListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{id}", response_model=KnowledgeResponse, summary="Get Single Knowledge Document")
def get_knowledge(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a single knowledge document if owned by current user.
    """
    return knowledge_service.get_knowledge_by_id(db, id, current_user.id)


@router.put("/{id}", response_model=KnowledgeResponse, summary="Update Knowledge Document")
def update_knowledge(
    id: uuid.UUID,
    data: KnowledgeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates an existing knowledge document. Re-computes word count & reading time if content changes.
    """
    return knowledge_service.update_knowledge(db, id, current_user.id, data)


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Delete Knowledge Document")
def delete_knowledge(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a knowledge document owned by the current user.
    """
    knowledge_service.delete_knowledge(db, id, current_user.id)
    return {"success": True, "message": "Knowledge document deleted successfully"}


@router.patch("/{id}/favorite", response_model=KnowledgeResponse, summary="Toggle Favorite Status")
def toggle_favorite(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggles the favorite flag on a knowledge document.
    """
    return knowledge_service.toggle_favorite(db, id, current_user.id)


@router.patch("/{id}/pin", response_model=KnowledgeResponse, summary="Toggle Pinned Status")
def toggle_pin(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggles the pinned flag on a knowledge document.
    """
    return knowledge_service.toggle_pin(db, id, current_user.id)


@router.patch("/{id}/archive", response_model=KnowledgeResponse, summary="Toggle Archive Status")
def toggle_archive(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggles the archive/active status on a knowledge document.
    """
    return knowledge_service.toggle_archive(db, id, current_user.id)
