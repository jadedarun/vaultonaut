from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import GoogleLoginRequest, AuthTokenResponse, GenericResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google", response_model=AuthTokenResponse, summary="Google OAuth Authentication")
async def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user with Google OAuth token (credential ID token or access token).
    Creates database user if first time login, updates last_login timestamp, and returns JWT.
    """
    raw_token = payload.credential or payload.access_token or payload.token
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token payload must include credential or access_token"
        )
    
    result = await AuthService.authenticate_google_user(db, raw_token)
    return result


@router.post("/logout", response_model=GenericResponse, summary="User Logout")
async def logout():
    """
    Provides a standardized API response for client-side JWT removal upon logout.
    """
    return GenericResponse(
        success=True,
        message="Logged out successfully"
    )
