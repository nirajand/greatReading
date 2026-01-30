from sqlalchemy import Column, Integer, ForeignKey
from .base import BaseModel

class ReadingSession(BaseModel):
    __tablename__ = "reading_sessions"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    start_page = Column(Integer)
    end_page = Column(Integer)
    words_encountered = Column(Integer, default=0)
    words_saved = Column(Integer, default=0)
