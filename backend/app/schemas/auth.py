from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserResponse


class GoogleLoginRequest(BaseModel):
    """Token payload from frontend (supports credential JWT or access_token)."""
    credential: Optional[str] = None
    access_token: Optional[str] = None
    token: Optional[str] = None  # Generic fallback parameter name


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class GenericResponse(BaseModel):
    success: bool
    message: str
