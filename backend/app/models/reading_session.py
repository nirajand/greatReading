from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ReadingSession(Base):
    __tablename__ = "reading_sessions"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_page = Column(Integer, default=1)
    end_page = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, default=0)
    words_encountered = Column(Integer, default=0)
    words_saved = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reading_sessions")
    book = relationship("Book", back_populates="reading_sessions")