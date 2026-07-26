import os
import uuid
import hashlib
import re
from datetime import datetime
from typing import Tuple
from fastapi import UploadFile, HTTPException, status

BASE_STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "uploads")
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB limit

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
}

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filename by stripping directory paths, null bytes, and non-printable characters.
    """
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty"
        )
    
    # Prevent directory traversal
    filename = os.path.basename(filename)
    filename = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', filename)
    filename = filename.strip('. ')
    
    if not filename or filename in ('.', '..'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or dangerous filename"
        )
    
    return filename


def validate_file_metadata(original_filename: str, content_type: Optional[str] = None) -> Tuple[str, str]:
    """
    Validates file extension and mime type.
    Returns (sanitized_original_filename, extension).
    """
    clean_name = sanitize_filename(original_filename)
    _, ext = os.path.splitext(clean_name)
    ext = ext.lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Supported formats: PDF, DOCX, TXT, MD."
        )
    
    return clean_name, ext


def compute_sha256(content: bytes) -> str:
    """Computes SHA-256 hex digest of file binary bytes."""
    return hashlib.sha256(content).hexdigest()


def save_uploaded_file(user_id: str, original_filename: str, content: bytes) -> dict:
    """
    Validates content, generates UUID filename, computes checksum, and writes file to storage.
    Returns dict with storage details.
    """
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)"
        )
    
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB"
        )
    
    clean_filename, ext = validate_file_metadata(original_filename)
    sha256_hash = compute_sha256(content)
    
    now = datetime.utcnow()
    year_str = now.strftime("%Y")
    month_str = now.strftime("%m")
    
    stored_filename = f"{uuid.uuid4()}{ext}"
    
    relative_path = os.path.join(str(user_id), "documents", year_str, month_str, stored_filename)
    absolute_path = os.path.abspath(os.path.join(BASE_STORAGE_DIR, relative_path))
    
    # Ensure security check against directory traversal
    storage_root = os.path.abspath(BASE_STORAGE_DIR)
    if not absolute_path.startswith(storage_root):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Illegal file storage path attempt"
        )
    
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    
    with open(absolute_path, "wb") as f:
        f.write(content)
        
    return {
        "original_filename": clean_filename,
        "stored_filename": stored_filename,
        "file_extension": ext,
        "file_size": len(content),
        "storage_path": absolute_path,
        "checksum_sha256": sha256_hash
    }


def delete_file_from_storage(storage_path: str) -> bool:
    """Deletes a file safely from local storage if it exists."""
    try:
        if os.path.exists(storage_path):
            os.remove(storage_path)
            return True
    except Exception:
        pass
    return False
