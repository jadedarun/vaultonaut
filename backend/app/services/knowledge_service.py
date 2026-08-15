import math
import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException, status

from app.models.knowledge import Knowledge
from app.schemas.knowledge import KnowledgeCreate, KnowledgeUpdate


def calculate_word_count(content: str) -> int:
    if not content:
        return 0
    return len(content.split())


def calculate_reading_time(word_count: int) -> int:
    if word_count <= 0:
        return 0
    return max(1, math.ceil(word_count / 200))


def create_knowledge(
    db: Session,
    user_id: uuid.UUID,
    data: KnowledgeCreate
) -> Knowledge:
    word_count = calculate_word_count(data.content)
    reading_time = calculate_reading_time(word_count)

    item = Knowledge(
        user_id=user_id,
        title=data.title.strip(),
        content=data.content,
        summary=data.summary.strip() if data.summary else None,
        category=data.category.strip() if data.category else "General",
        tags=data.tags or [],
        favorite=data.favorite,
        pinned=data.pinned,
        status="active",
        word_count=word_count,
        reading_time=reading_time
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    # Trigger vector indexing
    if item.category not in ("Flashcards", "Quizzes", "Summaries", "Study Notes"):
        try:
            from app.services import vector_sync_service
            vector_sync_service.process_knowledge_indexing(db, item, item.content)
        except Exception as err:
            from app.core.logging import logger
            logger.error(f"Failed to vector index knowledge item {item.id}: {err}")

    return item


def get_knowledge_by_id(
    db: Session,
    knowledge_id: uuid.UUID,
    user_id: uuid.UUID
) -> Knowledge:
    item = db.query(Knowledge).filter(
        Knowledge.id == knowledge_id,
        Knowledge.user_id == user_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge item not found"
        )
    return item


def get_user_knowledge_list(
    db: Session,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 10,
    sort: str = "created_at",
    order: str = "desc",
    category: Optional[str] = None,
    favorite: Optional[bool] = None,
    pinned: Optional[bool] = None,
    query: Optional[str] = None
) -> Tuple[List[Knowledge], int, int]:
    q = db.query(Knowledge).filter(Knowledge.user_id == user_id)

    # Filtering
    if category and category.strip() and category.lower() != "all":
        q = q.filter(Knowledge.category.ilike(category.strip()))
    
    if favorite is not None:
        q = q.filter(Knowledge.favorite == favorite)
        
    if pinned is not None:
        q = q.filter(Knowledge.pinned == pinned)

    # Case-insensitive SQL Search across title, content, category, tags
    if query and query.strip():
        search_pattern = f"%{query.strip().lower()}%"
        q = q.filter(
            or_(
                Knowledge.title.ilike(search_pattern),
                Knowledge.content.ilike(search_pattern),
                Knowledge.category.ilike(search_pattern)
            )
        )

    total = q.count()

    # Sorting
    sort_attr = getattr(Knowledge, sort, Knowledge.created_at)
    if order.lower() == "asc":
        q = q.order_by(asc(sort_attr))
    else:
        q = q.order_by(desc(sort_attr))

    # Pagination
    offset = (page - 1) * page_size
    items = q.offset(offset).limit(page_size).all()

    total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1
    return items, total, total_pages


def update_knowledge(
    db: Session,
    knowledge_id: uuid.UUID,
    user_id: uuid.UUID,
    data: KnowledgeUpdate
) -> Knowledge:
    item = get_knowledge_by_id(db, knowledge_id, user_id)
    content_changed = False

    if data.title is not None:
        item.title = data.title.strip()
    if data.content is not None:
        if item.content != data.content:
            content_changed = True
        item.content = data.content
        item.word_count = calculate_word_count(data.content)
        item.reading_time = calculate_reading_time(item.word_count)
    if data.summary is not None:
        item.summary = data.summary.strip() if data.summary else None
    if data.category is not None:
        item.category = data.category.strip()
    if data.tags is not None:
        item.tags = data.tags
    if data.favorite is not None:
        item.favorite = data.favorite
    if data.pinned is not None:
        item.pinned = data.pinned
    if data.status is not None:
        item.status = data.status

    db.commit()
    db.refresh(item)

    if content_changed:
        try:
            from app.services import vector_sync_service
            vector_sync_service.rebuild_knowledge_vectors(db, item, item.content)
        except Exception as err:
            from app.core.logging import logger
            logger.error(f"Failed to rebuild vector index for knowledge item {item.id}: {err}")

    return item


def delete_knowledge(
    db: Session,
    knowledge_id: uuid.UUID,
    user_id: uuid.UUID
) -> bool:
    item = get_knowledge_by_id(db, knowledge_id, user_id)
    
    # Clean up associated vector embeddings in ChromaDB
    try:
        from app.services import vector_sync_service
        vector_sync_service.delete_knowledge_vectors(db, user_id, knowledge_id)
    except Exception as err:
        from app.core.logging import logger
        logger.error(f"Failed to delete vector index for knowledge item {knowledge_id}: {err}")

    db.delete(item)
    db.commit()
    return True


def toggle_favorite(
    db: Session,
    knowledge_id: uuid.UUID,
    user_id: uuid.UUID
) -> Knowledge:
    item = get_knowledge_by_id(db, knowledge_id, user_id)
    item.favorite = not item.favorite
    db.commit()
    db.refresh(item)
    return item


def toggle_pin(
    db: Session,
    knowledge_id: uuid.UUID,
    user_id: uuid.UUID
) -> Knowledge:
    item = get_knowledge_by_id(db, knowledge_id, user_id)
    item.pinned = not item.pinned
    db.commit()
    db.refresh(item)
    return item


def toggle_archive(
    db: Session,
    knowledge_id: uuid.UUID,
    user_id: uuid.UUID
) -> Knowledge:
    item = get_knowledge_by_id(db, knowledge_id, user_id)
    item.status = "archived" if item.status == "active" else "active"
    db.commit()
    db.refresh(item)
    return item
