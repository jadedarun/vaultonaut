import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.core.logging import setup_logging, logger
from app.utils.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.structured_logging import StructuredLoggingMiddleware
from app.api.health import router as health_router
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.api.knowledge import router as knowledge_router
from app.api.documents import router as documents_router
from app.api.search import router as search_router
from app.api.chat import router as chat_router
from app.api.evaluation import router as evaluation_router



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    setup_logging()
    logger.info(f"Starting {settings.PROJECT_NAME} (v{settings.VERSION}) in [{settings.ENVIRONMENT}] mode.")
    
    # Ensure all tables exist in database
    from app.database.base import Base
    import app.models  # noqa: F401
    from app.database.session import engine
    Base.metadata.create_all(bind=engine)

    # Ensure uploads directory exists
    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    yield
    
    # Shutdown tasks
    logger.info(f"Shutting down {settings.PROJECT_NAME}.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Vaultonaut AI SaaS Backend Foundation - Production Ready API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Exception Handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# CORS Middleware (Must be outer-most to handle preflight OPTIONS requests first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Request Logging, Rate Limiting & Structured Logging Middleware
app.add_middleware(StructuredLoggingMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=200)
app.add_middleware(RequestLoggingMiddleware)

# Include Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(knowledge_router)
app.include_router(documents_router)
app.include_router(search_router)
app.include_router(chat_router)
app.include_router(evaluation_router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
