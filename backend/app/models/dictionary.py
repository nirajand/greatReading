from sqlalchemy import Column, String, Text, Integer, ForeignKey
from .base import BaseModel

class DictionaryEntry(BaseModel):
    __tablename__ = "dictionary_entries"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word = Column(String, nullable=False, index=True)
    definition = Column(Text, nullable=False)
    context = Column(Text)
    book_id = Column(Integer, ForeignKey("books.id"))
    page_number = Column(Integer)
    phonetic = Column(String)
    audio_url = Column(String)
    part_of_speech = Column(String)
    mastered = Column(Integer, default=0)
