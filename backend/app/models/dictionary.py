from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class DictionaryEntry(Base):
    __tablename__ = "dictionary_entries"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, index=True, nullable=False)
    definition = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    phonetic = Column(String, nullable=True)
    part_of_speech = Column(String, nullable=True)
    mastered = Column(Integer, default=0) # 0: New, 1: Learning, 2: Mastered
    book_id = Column(Integer, ForeignKey("books.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="dictionary_entries")