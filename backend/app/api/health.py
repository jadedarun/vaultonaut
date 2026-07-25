from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health Check")
async def health_check():
    """Returns the operational health status of the backend API."""
    return {"status": "healthy"}
