import os
import shutil
import hashlib
from typing import Tuple, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import logging
from pypdf import PdfReader, PdfWriter
from pypdf.errors import PdfReadError
import magic
from app.core.config import settings

logger = logging.getLogger("file_operations")

class EnhancedPDFService:
    @staticmethod
    def validate_pdf(file_path: str) -> Tuple[bool, Optional[str]]:
        try:
            if not os.path.exists(file_path):
                return False, "File does not exist"
            
            file_size = os.path.getsize(file_path)
            if file_size > settings.MAX_UPLOAD_SIZE:
                return False, f"File too large ({file_size} > {settings.MAX_UPLOAD_SIZE})"
            
            if file_size == 0:
                return False, "File is empty"
            
            mime = magic.Magic(mime=True)
            file_type = mime.from_file(file_path)
            if file_type != 'application/pdf':
                return False, f"Invalid file type: {file_type}"
            
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                if len(reader.pages) == 0:
                    return False, "PDF has no pages"
                if reader.is_encrypted:
                    return False, "PDF is encrypted"
            
            return True, None
        except Exception as e:
            logger.error(f"PDF validation error: {e}")
            return False, f"Validation error: {str(e)}"

    @staticmethod
    def calculate_file_hash(file_path: str) -> str:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    @staticmethod
    def save_pdf_with_validation(file, user_id: int) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        try:
            user_dir = Path(settings.UPLOAD_DIR) / str(user_id)
            user_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            original_filename = file.filename
            safe_filename = f"{user_id}_{timestamp}_{original_filename.replace(' ', '_')}"
            file_path = user_dir / safe_filename
            
            temp_path = file_path.with_suffix('.tmp')
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            is_valid, error_msg = EnhancedPDFService.validate_pdf(str(temp_path))
            if not is_valid:
                if temp_path.exists(): os.remove(temp_path)
                return None, None, error_msg
            
            file_hash = EnhancedPDFService.calculate_file_hash(str(temp_path))
            final_path = user_dir / f"{file_hash}.pdf"
            
            if final_path.exists():
                os.remove(temp_path)
            else:
                os.rename(temp_path, final_path)
            
            return str(final_path), original_filename, None
        except Exception as e:
            logger.error(f"Error saving PDF: {e}")
            return None, None, str(e)

    @staticmethod
    def extract_enhanced_metadata(file_path: str) -> Dict[str, Any]:
        metadata = {"title": "", "author": "", "total_pages": 0}
        try:
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                metadata["total_pages"] = len(reader.pages)
                if reader.metadata:
                    metadata["title"] = reader.metadata.get("/Title", "")
                    metadata["author"] = reader.metadata.get("/Author", "")
        except Exception as e:
            logger.error(f"Metadata error: {e}")
        return metadata

    @staticmethod
    def _human_readable_size(size_bytes: int) -> str:
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"
