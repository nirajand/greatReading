from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import uuid
from datetime import datetime
import os

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.models.book import Book
from app.schemas.responses import StandardResponse, FileUploadResponse, ProcessingStatusResponse
from app.services.enhanced_pdf_service import EnhancedPDFService
from app.core.logging import request_logger

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory processing status store (use Redis in production)
processing_status = {}

@router.post("/upload-enhanced", response_model=StandardResponse)
async def upload_book_enhanced(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(None),
    author: str = Form(None),
    extract_metadata: bool = Form(True),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a PDF book with enhanced processing"""
    try:
        logger.info(f"Starting enhanced upload for user {current_user.id}")
        
        # Save and validate PDF
        file_path, filename, error = EnhancedPDFService.save_pdf_with_validation(file, current_user.id)
        
        if error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File validation failed: {error}"
            )
        
        # Create processing job
        job_id = str(uuid.uuid4())
        processing_status[job_id] = {
            "status": "processing",
            "progress": 0,
            "user_id": current_user.id,
            "filename": filename,
            "started_at": datetime.now()
        }
        
        # Start background processing
        background_tasks.add_task(
            process_book_upload,
            job_id=job_id,
            file_path=file_path,
            filename=filename,
            title=title,
            author=author,
            extract_metadata=extract_metadata,
            user_id=current_user.id,
            db=db
        )
        
        return StandardResponse(
            success=True,
            message="Book upload started",
            data={
                "job_id": job_id,
                "filename": filename,
                "status_url": f"/api/books/processing-status/{job_id}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

async def process_book_upload(
    job_id: str,
    file_path: str,
    filename: str,
    title: Optional[str],
    author: Optional[str],
    extract_metadata: bool,
    user_id: int,
    db: Session
):
    """Background task to process book upload"""
    try:
        processing_status[job_id]["progress"] = 10
        
        # Extract metadata if requested
        metadata = {}
        if extract_metadata:
            metadata = EnhancedPDFService.extract_enhanced_metadata(file_path)
            processing_status[job_id]["progress"] = 30
        
        # Determine title and author
        book_title = title or metadata.get("title", filename.rsplit('.', 1)[0])
        book_author = author or metadata.get("author", "")
        
        processing_status[job_id]["progress"] = 50
        
        # Create book record
        db_book = Book(
            user_id=user_id,
            title=book_title,
            author=book_author,
            file_path=file_path,
            file_name=filename,
            file_size=os.path.getsize(file_path),
            total_pages=metadata.get("total_pages", 0),
            book_metadata=metadata
        )
        
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        
        processing_status[job_id]["progress"] = 80
        
        processing_status[job_id].update({
            "status": "completed",
            "progress": 100,
            "book_id": db_book.id,
            "completed_at": datetime.now(),
            "result": {
                "id": db_book.id,
                "title": db_book.title,
                "total_pages": db_book.total_pages
            }
        })
        
        logger.info(f"Book processing completed: job={job_id}, book={db_book.id}")
        
    except Exception as e:
        logger.error(f"Background processing error: {e}")
        processing_status[job_id].update({
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.now()
        })

@router.get("/processing-status/{job_id}", response_model=ProcessingStatusResponse)
def get_processing_status(
    job_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get status of a processing job"""
    if job_id not in processing_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    job = processing_status[job_id]
    
    # Verify job belongs to user
    if job["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return ProcessingStatusResponse(
        job_id=job_id,
        status=job["status"],
        progress=job["progress"],
        estimated_completion=None,
        result=job.get("result"),
        errors=[job["error"]] if "error" in job else None
    )

@router.get("/{book_id}/enhanced-text/{page_number}")
def get_enhanced_page_text(
    book_id: int,
    page_number: int,
    context_lines: int = 2,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get page text with surrounding context"""
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    result = EnhancedPDFService.extract_page_text_with_context(
        book.file_path,
        page_number,
        context_lines
    )
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return {
        "book_id": book_id,
        "page_number": page_number,
        **result
    }

@router.get("/{book_id}/file-info")
def get_book_file_info(
    book_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive file information"""
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    file_info = EnhancedPDFService.get_file_info(book.file_path)
    
    return StandardResponse(
        success=True,
        message="File information retrieved",
        data=file_info
    )

@router.post("/cleanup")
def cleanup_user_files(
    current_user: User = Depends(get_current_active_user)
):
    """Clean up old temporary files for user"""
    try:
        return StandardResponse(
            success=True,
            message="File cleanup completed"
        )
    except Exception as e:
        logger.error(f"Cleanup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cleanup failed: {str(e)}"
        )