import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_google_id(db: Session, google_id: str) -> Optional[User]:
        return db.query(User).filter(User.google_id == google_id).first()

    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        db_user = User(
            google_id=user_in.google_id,
            email=user_in.email,
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            full_name=user_in.full_name,
            profile_picture=user_in.profile_picture,
            email_verified=user_in.email_verified,
            last_login=datetime.now(timezone.utc)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update_user_profile(
        db: Session,
        user: User,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        full_name: Optional[str] = None,
        profile_picture: Optional[str] = None,
        email_verified: Optional[bool] = None
    ) -> User:
        user.last_login = datetime.now(timezone.utc)
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if full_name is not None:
            user.full_name = full_name
        if profile_picture is not None:
            user.profile_picture = profile_picture
        if email_verified is not None:
            user.email_verified = email_verified
            
        db.commit()
        db.refresh(user)
        return user

