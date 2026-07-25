import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config.settings import settings
from app.core.logging import logger

db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

try:
    connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        connect_args=connect_args,
    )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to local SQLite database 'vaultonaut_local.db'...")
    fallback_url = "sqlite:///./vaultonaut_local.db"
    engine = create_engine(
        fallback_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
    from app.database.base import Base
    from app.models.user import User  # noqa
    Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency injection helper for FastAPI routes to manage DB session lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
