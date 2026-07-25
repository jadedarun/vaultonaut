from fastapi import APIRouter, Depends
from app.schemas.user import UserResponse
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse, summary="Get Current Authenticated User Profile")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently logged-in user.
    Requires a valid JWT Bearer Token in the Authorization header.
    """
    return current_user
