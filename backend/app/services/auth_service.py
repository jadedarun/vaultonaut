import asyncio
from typing import Dict, Any
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.services.user_service import UserService
from app.schemas.user import UserCreate
from app.core.security import create_access_token
from app.core.logging import logger


class AuthService:
    @staticmethod
    async def verify_google_token(raw_token: str) -> Dict[str, Any]:
        """
        Verifies a Google OAuth token.
        Detects JWT ID Tokens vs OAuth2 Access Tokens automatically and verifies without blocking the event loop.
        """
        raw_token_clean = raw_token.strip()

        # Check if token is a Google JWT ID Token (contains exactly 2 dots)
        if raw_token_clean.count(".") == 2 and not raw_token_clean.startswith("ya29"):
            try:
                def _verify_id_token_sync():
                    request = google_requests.Request()
                    return id_token.verify_oauth2_token(
                        raw_token_clean,
                        request,
                        settings.GOOGLE_CLIENT_ID,
                        clock_skew_in_seconds=10
                    )

                id_info = await asyncio.to_thread(_verify_id_token_sync)

                # Validate issuer
                issuer = id_info.get("iss")
                if issuer not in ["accounts.google.com", "https://accounts.google.com"]:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Invalid token issuer: {issuer}"
                    )

                # Validate email_verified
                if not id_info.get("email_verified", False):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Google account email is not verified"
                    )

                return {
                    "sub": id_info.get("sub"),
                    "email": id_info.get("email"),
                    "given_name": id_info.get("given_name"),
                    "family_name": id_info.get("family_name"),
                    "name": id_info.get("name"),
                    "picture": id_info.get("picture"),
                    "email_verified": id_info.get("email_verified", True),
                }
            except HTTPException:
                raise
            except Exception as id_err:
                logger.info(f"ID Token verification failed ({id_err}). Attempting OAuth userinfo fallback...")

        # OAuth2 Access Token fallback via async HTTP client
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {raw_token_clean}"}
                )
                if resp.status_code == 200:
                    info = resp.json()
                    
                    if not info.get("email_verified", True):
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Google account email is not verified"
                        )

                    return {
                        "sub": info.get("sub"),
                        "email": info.get("email"),
                        "given_name": info.get("given_name"),
                        "family_name": info.get("family_name"),
                        "name": info.get("name"),
                        "picture": info.get("picture"),
                        "email_verified": info.get("email_verified", True),
                    }
                else:
                    logger.warning(f"Google Userinfo API returned status {resp.status_code}: {resp.text}")
        except HTTPException:
            raise
        except Exception as http_err:
            logger.error(f"HTTP call to Google userinfo endpoint failed: {http_err}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google OAuth token"
        )

    @classmethod
    async def authenticate_google_user(cls, db: Session, raw_token: str) -> Dict[str, Any]:
        """
        Full authentication flow:
        Verify token -> Check/Create user in PostgreSQL -> Issue backend JWT token
        """
        google_profile = await cls.verify_google_token(raw_token)

        google_id = google_profile.get("sub")
        email = google_profile.get("email")

        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token payload missing essential profile fields (sub, email)"
            )

        first_name = google_profile.get("given_name")
        last_name = google_profile.get("family_name")
        full_name = google_profile.get("name") or f"{first_name or ''} {last_name or ''}".strip()
        picture = google_profile.get("picture")
        email_verified = google_profile.get("email_verified", True)

        # 1. Lookup user in DB
        user = UserService.get_by_google_id(db, google_id)
        if not user:
            # Fallback lookup by email
            user = UserService.get_by_email(db, email)

        if user:
            # Returning user -> Update profile & login time
            user = UserService.update_user_profile(
                db=db,
                user=user,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
                profile_picture=picture,
                email_verified=email_verified
            )
            logger.info(f"User authenticated successfully: {user.email}")
        else:
            # First time user -> Create record
            user_create = UserCreate(
                google_id=google_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
                profile_picture=picture,
                email_verified=email_verified
            )
            user = UserService.create_user(db, user_create)
            logger.info(f"Created new user account: {user.email}")

        # 2. Issue JWT token
        jwt_token = create_access_token(
            user_id=user.id,
            email=user.email,
            name=user.full_name or user.first_name or ""
        )

        return {
            "access_token": jwt_token,
            "token_type": "bearer",
            "user": user
        }
