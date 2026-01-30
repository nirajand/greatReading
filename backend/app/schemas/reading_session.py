from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReadingSessionBase(BaseModel):
    book_id: int
    duration_minutes: int
    start_page: Optional[int] = None
    end_page: Optional[int] = None

class ReadingSessionCreate(ReadingSessionBase):
    pass

class ReadingSessionUpdate(BaseModel):
    end_page: Optional[int] = None
    words_encountered: Optional[int] = None
    words_saved: Optional[int] = None

class ReadingSessionInDB(ReadingSessionBase):
    id: int
    user_id: int
    words_encountered: int = 0
    words_saved: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ReadingSession(ReadingSessionInDB):
    pass

class ReadingStats(BaseModel):
    total_sessions: int
    total_minutes: int
    total_books: int
    total_words_saved: int
    average_session_length: float
    favorite_reading_time: Optional[str] = None
