"""
Fix common setup issues.
"""
import os
import shutil
import sys

def cleanup():
    """Remove any problematic files."""
    print("🧹 Cleaning up...")
    
    files_to_remove = [
        "greatreading.db",
        "test_setup.py",
        "test_db.py",
        "test_complete.py"
    ]
    
    for file in files_to_remove:
        if os.path.exists(file):
            os.remove(file)
            print(f"  Removed: {file}")
    
    # Remove __pycache__ directories
    for root, dirs, files in os.walk("."):
        if "__pycache__" in dirs:
            pycache_path = os.path.join(root, "__pycache__")
            shutil.rmtree(pycache_path)
            print(f"  Removed: {pycache_path}")

def create_simple_models():
    """Create simplified model files."""
    print("\n📝 Creating simplified models...")
    
    # Create base model
    base_content = '''from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime
from datetime import datetime

Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
'''
    
    with open("app/models/base.py", "w") as f:
        f.write(base_content)
    print("  Created: app/models/base.py")
    
    # Create user model
    user_content = '''from sqlalchemy import Column, String, Boolean
from .base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
'''
    
    with open("app/models/user.py", "w") as f:
        f.write(user_content)
    print("  Created: app/models/user.py")
    
    # Create book model (simplified)
    book_content = '''from sqlalchemy import Column, String, Integer, Float, ForeignKey
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
'''
    
    with open("app/models/book.py", "w") as f:
        f.write(book_content)
    print("  Created: app/models/book.py")
    
    # Create dictionary model
    dict_content = '''from sqlalchemy import Column, String, Text, Integer, ForeignKey
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
'''
    
    with open("app/models/dictionary.py", "w") as f:
        f.write(dict_content)
    print("  Created: app/models/dictionary.py")
    
    # Create reading session model
    session_content = '''from sqlalchemy import Column, Integer, ForeignKey
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
'''
    
    with open("app/models/reading_session.py", "w") as f:
        f.write(session_content)
    print("  Created: app/models/reading_session.py")
    
    # Create __init__.py
    init_content = '''from .base import Base, BaseModel
from .user import User
from .book import Book
from .dictionary import DictionaryEntry
from .reading_session import ReadingSession

__all__ = ["Base", "BaseModel", "User", "Book", "DictionaryEntry", "ReadingSession"]
'''
    
    with open("app/models/__init__.py", "w") as f:
        f.write(init_content)
    print("  Created: app/models/__init__.py")

def verify_setup():
    """Verify the setup works."""
    print("\n🔍 Verifying setup...")
    
    try:
        # Test imports
        sys.path.append(".")
        from app.core.config import settings
        from app.core.database import init_db
        
        print(f"  ✅ Configuration loaded")
        print(f"     Database: {settings.DATABASE_URL}")
        
        # Initialize database
        init_db()
        print("  ✅ Database initialized")
        
        # Check if database file exists
        if settings.DATABASE_URL.startswith("sqlite"):
            db_file = settings.DATABASE_URL.replace("sqlite:///./", "")
            if os.path.exists(db_file):
                print(f"  ✅ Database file created: {db_file}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Verification failed: {e}")
        return False

def main():
    print("="*60)
    print("🛠️  Fixing GreatReading Backend Setup")
    print("="*60)
    
    cleanup()
    create_simple_models()
    
    if verify_setup():
        print("\n" + "="*60)
        print("✅ Setup fixed successfully!")
        print("="*60)
        print("\nTo start the backend:")
        print("uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("\n" + "="*60)
        print("❌ Setup still has issues.")
        print("="*60)
        sys.exit(1)

if __name__ == "__main__":
    main()
