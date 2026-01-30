from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class BookBase(BaseModel):
    title: str

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: int
    filename: str
    status: str
    owner_id: int
    created_at: datetime
    content: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)