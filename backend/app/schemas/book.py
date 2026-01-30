from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class BookBase(BaseModel):
    title: str
    author: Optional[str] = None

class BookCreate(BookBase):
    file_name: str
    file_size: int

class BookUpdate(BaseModel):
    current_page: Optional[int] = None
    progress: Optional[float] = None
    book_metadata: Optional[Dict[str, Any]] = None

class BookInDB(BookBase):
    id: int
    user_id: int
    file_path: str
    file_name: str
    file_size: int
    total_pages: Optional[int] = None
    current_page: int = 1
    progress: float = 0.0
    book_metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Book(BookInDB):
    pass

class BookWithProgress(Book):
    time_spent: Optional[float] = 0.0
    words_saved: Optional[int] = 0
