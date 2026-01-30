import os
import shutil
import hashlib
from typing import Tuple, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import logging
from pypdf import PdfReader, PdfWriter
from pypdf.errors import PdfReadError
import magic  # python-magic
from app.core.config import settings

logger = logging.getLogger("file_operations")

class EnhancedPDFService:
    """Enhanced PDF service with validation, security checks, and caching"""
    
    @staticmethod
    def validate_pdf(file_path: str) -> Tuple[bool, Optional[str]]:
        """Validate PDF file for security and integrity"""
        try:
            # Check file exists
            if not os.path.exists(file_path):
                return False, "File does not exist"
            
            # Check file size
            file_size = os.path.getsize(file_path)
            if file_size > settings.MAX_UPLOAD_SIZE:
                return False, f"File too large ({file_size} > {settings.MAX_UPLOAD_SIZE})"
            
            if file_size == 0:
                return False, "File is empty"
            
            # Check MIME type
            mime = magic.Magic(mime=True)
            file_type = mime.from_file(file_path)
            if file_type != 'application/pdf':
                return False, f"Invalid file type: {file_type}"
            
            # Try to read PDF
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                if len(reader.pages) == 0:
                    return False, "PDF has no pages"
                
                # Check for encryption
                if reader.is_encrypted:
                    return False, "PDF is encrypted"
            
            return True, None
            
        except PdfReadError as e:
            logger.error(f"PDF read error: {e}")
            return False, f"Invalid PDF file: {str(e)}"
        except Exception as e:
            logger.error(f"PDF validation error: {e}")
            return False, f"Validation error: {str(e)}"
    
    @staticmethod
    def calculate_file_hash(file_path: str) -> str:
        """Calculate SHA-256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    @staticmethod
    def save_pdf_with_validation(file, user_id: int) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """Save uploaded PDF with validation and return (file_path, filename, error)"""
        try:
            # Create user-specific directory
            user_dir = Path(settings.UPLOAD_DIR) / str(user_id)
            user_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            original_filename = file.filename
            safe_filename = f"{user_id}_{timestamp}_{original_filename.replace(' ', '_')}"
            file_path = user_dir / safe_filename
            
            logger.info(f"Saving PDF: {original_filename} for user {user_id}")
            
            # Save file temporarily
            temp_path = file_path.with_suffix('.tmp')
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Validate PDF
            is_valid, error_msg = EnhancedPDFService.validate_pdf(temp_path)
            if not is_valid:
                os.remove(temp_path)
                logger.warning(f"PDF validation failed: {error_msg}")
                return None, None, error_msg
            
            # Calculate file hash
            file_hash = EnhancedPDFService.calculate_file_hash(temp_path)
            
            # Check for duplicate files by hash
            hash_file = user_dir / f"{file_hash}.pdf"
            if hash_file.exists():
                os.remove(temp_path)
                logger.info(f"Duplicate file detected, using existing: {hash_file}")
                return str(hash_file), original_filename, None
            
            # Rename temp file to final name
            final_path = user_dir / f"{file_hash}.pdf"
            os.rename(temp_path, final_path)
            
            # Create symbolic link with original name for easy access
            link_path = file_path
            if link_path.exists():
                link_path.unlink()
            os.symlink(final_path, link_path)
            
            logger.info(f"PDF saved successfully: {final_path}")
            return str(link_path), original_filename, None
            
        except Exception as e:
            logger.error(f"Error saving PDF: {e}")
            return None, None, f"Failed to save file: {str(e)}"
    
    @staticmethod
    def extract_enhanced_metadata(file_path: str) -> Dict[str, Any]:
        """Extract comprehensive metadata from PDF"""
        metadata = {
            "title": "",
            "author": "",
            "total_pages": 0,
            "producer": "",
            "creator": "",
            "creation_date": "",
            "mod_date": "",
            "keywords": "",
            "subject": "",
            "file_size": 0,
            "file_hash": "",
            "extraction_errors": []
        }
        
        try:
            # Get file stats
            file_stats = os.stat(file_path)
            metadata["file_size"] = file_stats.st_size
            metadata["file_hash"] = EnhancedPDFService.calculate_file_hash(file_path)
            
            # Extract PDF metadata
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                
                metadata["total_pages"] = len(reader.pages)
                
                if reader.metadata:
                    pdf_metadata = reader.metadata
                    metadata.update({
                        "title": pdf_metadata.get("/Title", ""),
                        "author": pdf_metadata.get("/Author", ""),
                        "producer": pdf_metadata.get("/Producer", ""),
                        "creator": pdf_metadata.get("/Creator", ""),
                        "creation_date": pdf_metadata.get("/CreationDate", ""),
                        "mod_date": pdf_metadata.get("/ModDate", ""),
                        "keywords": pdf_metadata.get("/Keywords", ""),
                        "subject": pdf_metadata.get("/Subject", "")
                    })
                
                # Try to extract text from first few pages for better title detection
                if not metadata["title"] or metadata["title"].strip() == "":
                    try:
                        first_page = reader.pages[0]
                        text = first_page.extract_text()[:500]  # First 500 chars
                        # Simple heuristic: first line might be title
                        lines = text.split('\n')
                        if lines and len(lines[0].strip()) > 3:
                            metadata["title"] = lines[0].strip()[:100]
                    except:
                        metadata["extraction_errors"].append("Failed to extract text for title detection")
                
        except PdfReadError as e:
            metadata["extraction_errors"].append(f"PDF read error: {str(e)}")
            logger.error(f"PDF metadata extraction error: {e}")
        except Exception as e:
            metadata["extraction_errors"].append(f"Unexpected error: {str(e)}")
            logger.error(f"Unexpected error extracting metadata: {e}")
        
        return metadata
    
    @staticmethod
    def extract_page_text_with_context(file_path: str, page_number: int, 
                                      context_lines: int = 2) -> Dict[str, Any]:
        """Extract text from page with surrounding context"""
        try:
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                
                if page_number < 1 or page_number > len(reader.pages):
                    return {"error": "Invalid page number", "text": ""}
                
                # Extract current page text
                page = reader.pages[page_number - 1]
                current_text = page.extract_text()
                
                # Extract context from previous page if available
                previous_text = ""
                if page_number > 1:
                    prev_page = reader.pages[page_number - 2]
                    prev_text = prev_page.extract_text()
                    lines = prev_text.split('\n')
                    previous_text = '\n'.join(lines[-context_lines:]) if len(lines) > context_lines else prev_text
                
                # Extract context from next page if available
                next_text = ""
                if page_number < len(reader.pages):
                    next_page = reader.pages[page_number]
                    next_page_text = next_page.extract_text()
                    lines = next_page_text.split('\n')
                    next_text = '\n'.join(lines[:context_lines]) if len(lines) > context_lines else next_page_text
                
                return {
                    "current_page_text": current_text,
                    "previous_context": previous_text,
                    "next_context": next_text,
                    "has_previous": page_number > 1,
                    "has_next": page_number < len(reader.pages),
                    "total_pages": len(reader.pages)
                }
                
        except Exception as e:
            logger.error(f"Error extracting page text: {e}")
            return {"error": str(e), "text": ""}
    
    @staticmethod
    def split_pdf_by_chapters(file_path: str, max_pages_per_chunk: int = 50) -> Dict[str, Any]:
        """Split PDF into manageable chunks for better reading experience"""
        try:
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                total_pages = len(reader.pages)
                
                chunks = []
                for start in range(0, total_pages, max_pages_per_chunk):
                    end = min(start + max_pages_per_chunk, total_pages)
                    
                    writer = PdfWriter()
                    for page_num in range(start, end):
                        writer.add_page(reader.pages[page_num])
                    
                    # Save chunk to temporary file
                    chunk_hash = hashlib.md5(f"{file_path}_{start}_{end}".encode()).hexdigest()
                    chunk_path = Path(file_path).parent / f"chunk_{chunk_hash}.pdf"
                    
                    with open(chunk_path, 'wb') as chunk_file:
                        writer.write(chunk_file)
                    
                    chunks.append({
                        "start_page": start + 1,
                        "end_page": end,
                        "total_pages": end - start,
                        "chunk_path": str(chunk_path),
                        "chunk_hash": chunk_hash
                    })
                
                return {
                    "total_chunks": len(chunks),
                    "chunks": chunks,
                    "original_pages": total_pages
                }
                
        except Exception as e:
            logger.error(f"Error splitting PDF: {e}")
            return {"error": str(e)}
    
    @staticmethod
    def cleanup_old_files(user_id: int, max_age_days: int = 30):
        """Clean up old temporary files"""
        try:
            user_dir = Path(settings.UPLOAD_DIR) / str(user_id)
            if not user_dir.exists():
                return
            
            cutoff_time = datetime.now().timestamp() - (max_age_days * 24 * 3600)
            
            for file_path in user_dir.glob("*.tmp"):
                if file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    logger.info(f"Cleaned up old temp file: {file_path}")
            
            for file_path in user_dir.glob("chunk_*.pdf"):
                if file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    logger.info(f"Cleaned up old chunk file: {file_path}")
                    
        except Exception as e:
            logger.error(f"Error cleaning up old files: {e}")
    
    @staticmethod
    def get_file_info(file_path: str) -> Dict[str, Any]:
        """Get comprehensive file information"""
        try:
            path = Path(file_path)
            stats = path.stat()
            
            return {
                "path": str(path),
                "filename": path.name,
                "size_bytes": stats.st_size,
                "size_human": EnhancedPDFService._human_readable_size(stats.st_size),
                "created": datetime.fromtimestamp(stats.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stats.st_mtime).isoformat(),
                "hash": EnhancedPDFService.calculate_file_hash(file_path),
                "exists": path.exists(),
                "is_symlink": path.is_symlink()
            }
        except Exception as e:
            logger.error(f"Error getting file info: {e}")
            return {"error": str(e)}
    
    @staticmethod
    def _human_readable_size(size_bytes: int) -> str:
        """Convert bytes to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"