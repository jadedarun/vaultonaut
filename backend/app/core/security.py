import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.session import get_db
from app.models.user import User
from app.core.logging import logger

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    """Hashes plain password using Passlib Bcrypt (future password login support)."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: uuid.UUID, email: str, name: Optional[str] = None, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token containing user_id, email, name, exp, and iat."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(user_id),
        "user_id": str(user_id),
        "email": email,
        "name": name or "",
        "exp": expire,
        "iat": now
    }

    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Decodes and validates a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"JWT Decoding failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """FastAPI Dependency injection to retrieve currently authenticated user from Bearer JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject identifier"
        )
    
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token payload"
        )

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    return user


def create_developer_token(user_id: uuid.UUID, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT developer session token with elevated claims."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=2)

    to_encode = {
        "sub": str(user_id),
        "user_id": str(user_id),
        "is_developer": True,
        "exp": expire,
        "iat": now
    }

    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def get_current_developer_user(
    x_developer_token: Optional[str] = Header(None),
    current_user: User = Depends(get_current_user)
) -> User:
    """FastAPI Dependency injection to retrieve authorized developer from header."""
    if not x_developer_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Developer mode elevated authorization required"
        )

    try:
        payload = jwt.decode(x_developer_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        logger.warning(f"Developer JWT Decoding failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate developer session or token expired"
        )

    user_id_str: Optional[str] = payload.get("sub")
    is_developer: bool = payload.get("is_developer", False)

    if not user_id_str or str(current_user.id) != user_id_str or not is_developer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: unauthorized developer session"
        )

    return current_user
