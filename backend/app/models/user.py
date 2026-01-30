from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    books = relationship("Book", back_populates="owner", cascade="all, delete-orphan")
    dictionary_entries = relationship("DictionaryEntry", back_populates="user")
    reading_sessions = relationship("ReadingSession", back_populates="user")