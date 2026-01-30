from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class DictionaryEntryBase(BaseModel):
    word: str
    definition: str
    context: Optional[str] = None
    book_id: Optional[int] = None
    page_number: Optional[int] = None

class DictionaryEntryCreate(DictionaryEntryBase):
    phonetic: Optional[str] = None
    audio_url: Optional[str] = None
    part_of_speech: Optional[str] = None
    examples: Optional[List[str]] = None

class DictionaryEntryUpdate(BaseModel):
    definition: Optional[str] = None
    context: Optional[str] = None
    mastered: Optional[int] = None
    examples: Optional[List[str]] = None

class DictionaryEntryInDB(DictionaryEntryBase):
    id: int
    user_id: int
    phonetic: Optional[str] = None
    audio_url: Optional[str] = None
    part_of_speech: Optional[str] = None
    examples: Optional[List[Any]] = None
    mastered: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DictionaryEntry(DictionaryEntryInDB):
    pass

class WordLookup(BaseModel):
    word: str
    phonetic: Optional[str] = None
    meanings: List[Any]
    phonetics: List[Any]
