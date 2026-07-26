import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, UploadFile, File, status, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.document import (
    DocumentResponse,
    DocumentListResponse,
    DocumentStatusResponse,
    DocumentStatisticsResponse
)
from app.services import document_service

router = APIRouter(prefix="/api/documents", tags=["Document Ingestion"])


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED, summary="Upload Single Document")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Uploads a single document (PDF, DOCX, TXT, MD) and executes the ingestion pipeline.
    """
    content = await file.read()
    document = document_service.process_document_pipeline(
        db=db,
        user_id=current_user.id,
        original_filename=file.filename or "file",
        content=content,
        content_type=file.content_type
    )
    return document


@router.post("/upload-multiple", response_model=List[DocumentResponse], status_code=status.HTTP_201_CREATED, summary="Batch Upload Documents")
async def upload_multiple_documents(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Uploads multiple documents in batch and executes the ingestion pipeline for each.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided for batch upload"
        )
    
    results = []
    errors = []
    
    for file in files:
        try:
            content = await file.read()
            doc = document_service.process_document_pipeline(
                db=db,
                user_id=current_user.id,
                original_filename=file.filename or "file",
                content=content,
                content_type=file.content_type
            )
            results.append(doc)
        except Exception as err:
            errors.append(f"File '{file.filename}': {str(err)}")
            
    if not results and errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"All batch uploads failed: {'; '.join(errors)}"
        )
        
    return results


@router.get("", response_model=DocumentListResponse, summary="List Authenticated User Documents")
def list_documents(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(default=None, description="Filter by status (completed, uploading, failed)"),
    extension: Optional[str] = Query(default=None, description="Filter by file extension (.pdf, .docx, .txt, .md)"),
    query: Optional[str] = Query(default=None, description="Search query string"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a paginated, filterable list of documents owned by the current user.
    """
    items, total, total_pages = document_service.get_user_documents_list(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        status_filter=status,
        extension_filter=extension,
        query=query
    )
    return DocumentListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/statistics", response_model=DocumentStatisticsResponse, summary="Get Document Dashboard Statistics")
def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns summary document statistics (storage used, count, file types) for the current user.
    """
    return document_service.get_document_statistics(db, current_user.id)


@router.get("/{id}", response_model=DocumentResponse, summary="Get Single Document Metadata")
def get_document(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns detailed document metadata if owned by current user.
    """
    return document_service.get_document_by_id(db, id, current_user.id)


@router.get("/{id}/status", response_model=DocumentStatusResponse, summary="Get Document Processing Status")
def get_document_status(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns live processing stage and status for a specific document.
    """
    doc = document_service.get_document_by_id(db, id, current_user.id)
    return DocumentStatusResponse(
        id=doc.id,
        original_filename=doc.original_filename,
        status=doc.status,
        processing_stage=doc.processing_stage,
        page_count=doc.page_count,
        word_count=doc.word_count,
        processed_at=doc.processed_at
    )


@router.get("/{id}/download", summary="Secure Document Download")
def download_document(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Securely streams the raw document file for download after checking ownership.
    """
    doc = document_service.get_document_by_id(db, id, current_user.id)
    return FileResponse(
        path=doc.storage_path,
        filename=doc.original_filename,
        media_type=doc.mime_type
    )


@router.delete("/{id}", status_code=status.HTTP_200_OK, summary="Delete Document")
def delete_document(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes document record and associated file from storage.
    """
    document_service.delete_document(db, id, current_user.id)
    return {"success": True, "message": "Document deleted successfully"}
