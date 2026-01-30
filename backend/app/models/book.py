from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    author = Column(String, nullable=True)  # Required by your tests
    filename = Column(String, unique=True, nullable=False)
    file_path = Column(String, nullable=False)
    status = Column(String, default="processing")
    content = Column(Text, nullable=True)
    total_pages = Column(Integer, default=0) # Required by your tests
    current_page = Column(Integer, default=0)
    progress = Column(Float, default=0.0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="books")
    reading_sessions = relationship("ReadingSession", back_populates="book")