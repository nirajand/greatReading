import os
from typing import Optional, Tuple
from pypdf import PdfReader
import shutil
from datetime import datetime

class PDFService:
    @staticmethod
    def save_pdf(file, user_id: int) -> Tuple[str, str]:
        """Save uploaded PDF and return file path and filename"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{user_id}_{timestamp}_{file.filename}"
        file_path = os.path.join("uploads", filename)
        
        # Ensure uploads directory exists
        os.makedirs("uploads", exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return file_path, filename
    
    @staticmethod
    def extract_pdf_metadata(file_path: str) -> dict:
        """Extract metadata from PDF file"""
        try:
            reader = PdfReader(file_path)
            metadata = reader.metadata
            total_pages = len(reader.pages)
            
            # Try to extract text from first page for title/author detection
            title = metadata.get("/Title", "") if metadata else ""
            author = metadata.get("/Author", "") if metadata else ""
            
            # If no metadata, use filename as title
            if not title:
                title = os.path.basename(file_path).rsplit('.', 1)[0]
            
            return {
                "title": title,
                "author": author,
                "total_pages": total_pages,
                "producer": metadata.get("/Producer", "") if metadata else "",
                "creator": metadata.get("/Creator", "") if metadata else "",
                "creation_date": metadata.get("/CreationDate", "") if metadata else ""
            }
        except Exception as e:
            return {
                "title": os.path.basename(file_path).rsplit('.', 1)[0],
                "total_pages": 0,
                "error": str(e)
            }
    
    @staticmethod
    def extract_page_text(file_path: str, page_number: int) -> str:
        """Extract text from specific page"""
        try:
            reader = PdfReader(file_path)
            if page_number < 1 or page_number > len(reader.pages):
                return ""
            
            page = reader.pages[page_number - 1]
            text = page.extract_text()
            return text
        except Exception:
            return ""
    
    @staticmethod
    def delete_pdf(file_path: str):
        """Delete PDF file"""
        if os.path.exists(file_path):
            os.remove(file_path)
