from pydantic import BaseModel
from typing import Any, Optional, List, Dict
from datetime import datetime

class StandardResponse(BaseModel):
    """Standard API response format"""
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None
    timestamp: datetime = datetime.now()
    request_id: Optional[str] = None

class PaginatedResponse(BaseModel):
    """Paginated response format"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

class ErrorResponse(BaseModel):
    """Error response format"""
    error: str
    code: str
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None
    timestamp: datetime = datetime.now()

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: datetime
    dependencies: Dict[str, str]
    uptime: float

class FileUploadResponse(BaseModel):
    """File upload response"""
    id: int
    filename: str
    original_name: str
    size: int
    mime_type: str
    hash: str
    upload_time: datetime
    url: Optional[str] = None

class ProcessingStatusResponse(BaseModel):
    """Processing status response"""
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: float  # 0-100
    estimated_completion: Optional[datetime] = None
    result: Optional[Any] = None
    errors: Optional[List[str]] = None
