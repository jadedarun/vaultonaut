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


@router.post("/demo", response_model=AuthTokenResponse, summary="Demo/Developer Bypass Authentication")
async def demo_login(db: Session = Depends(get_db)):
    """
    Authenticates a mock developer user for offline development.
    Creates a PostgreSQL user if it doesn't exist and returns a valid JWT.
    """
    from app.services.user_service import UserService
    from app.schemas.user import UserCreate
    from app.core.security import create_access_token
    
    google_id = "google-uid-demo-12345"
    email = "arun@gmail.com"
    
    user = UserService.get_by_google_id(db, google_id)
    if not user:
        user = UserService.get_by_email(db, email)
        
    if not user:
        user_create = UserCreate(
            google_id=google_id,
            email=email,
            first_name="Arun",
            last_name="Developer",
            full_name="Arun Developer",
            profile_picture="",
            email_verified=True
        )
        user = UserService.create_user(db, user_create)
        
    jwt_token = create_access_token(
        user_id=user.id,
        email=user.email,
        name=user.full_name or user.first_name or ""
    )
    
    return AuthTokenResponse(
        access_token=jwt_token,
        token_type="bearer",
        user=user
    )
