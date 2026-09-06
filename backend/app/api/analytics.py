from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.analytics import AnalyticsOverviewResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["Personal Learning Analytics"])


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Personal Learning & Knowledge Analytics Overview"
)
def get_analytics_overview(
    time_range: str = Query("30d", pattern="^(7d|30d|all)$", description="Activity time filter (7d, 30d, all)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns authentic, user-scoped metrics covering vault documents, study conversations,
    synthesized learning aids, real activity timeline, and deterministic learning insights.
    Enforces strict user isolation.
    """
    return analytics_service.get_user_analytics(
        db=db,
        user_id=current_user.id,
        time_range=time_range
    )
