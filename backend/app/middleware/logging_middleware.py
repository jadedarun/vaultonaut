import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        logger.info(f"[{request_id}] Incoming {request.method} request to {request.url.path}")
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        logger.info(f"[{request_id}] Completed {request.method} {request.url.path} with status {response.status_code} in {process_time:.2f}ms")
        
        response.headers["X-Request-ID"] = request_id
        return response
