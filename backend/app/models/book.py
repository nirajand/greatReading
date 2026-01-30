from sqlalchemy import Column, String, Integer, Float, ForeignKey
from .base import BaseModel

class Book(BaseModel):
    __tablename__ = "books"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    author = Column(String)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer)
    total_pages = Column(Integer)
    current_page = Column(Integer, default=1)
    progress = Column(Float, default=0.0)
