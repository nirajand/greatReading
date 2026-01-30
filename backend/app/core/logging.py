import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
import json
from datetime import datetime
from typing import Dict, Any
from .config import settings

def setup_logging():
    """Setup application logging configuration"""
    
    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Configure logging format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    # Create formatter
    formatter = logging.Formatter(log_format, date_format)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File handler with rotation
    file_handler = RotatingFileHandler(
        logs_dir / "greatreading.log",
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    
    # Error file handler (errors only)
    error_handler = RotatingFileHandler(
        logs_dir / "errors.log",
        maxBytes=10485760,
        backupCount=10
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    root_logger.addHandler(error_handler)
    
    # API request logger
    api_logger = logging.getLogger("api")
    api_handler = RotatingFileHandler(
        logs_dir / "api_requests.log",
        maxBytes=10485760,
        backupCount=10
    )
    api_handler.setFormatter(formatter)
    api_logger.addHandler(api_handler)
    
    # Database logger
    db_logger = logging.getLogger("database")
    db_handler = RotatingFileHandler(
        logs_dir / "database.log",
        maxBytes=10485760,
        backupCount=10
    )
    db_handler.setFormatter(formatter)
    db_logger.addHandler(db_handler)
    
    # File operations logger
    file_logger = logging.getLogger("file_operations")
    file_op_handler = RotatingFileHandler(
        logs_dir / "file_operations.log",
        maxBytes=10485760,
        backupCount=10
    )
    file_op_handler.setFormatter(formatter)
    file_logger.addHandler(file_op_handler)

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, "extra"):
            log_record.update(record.extra)
        
        return json.dumps(log_record)

class RequestLogger:
    """Logger for API requests"""
    
    def __init__(self):
        self.logger = logging.getLogger("api")
    
    def log_request(self, request_id: str, method: str, path: str, 
                   status_code: int, duration: float, user_id: int = None):
        """Log an API request"""
        extra = {
            "request_id": request_id,
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": round(duration * 1000, 2),
            "user_id": user_id
        }
        
        if status_code >= 400:
            self.logger.error(f"Request failed: {method} {path} - {status_code}", extra=extra)
        else:
            self.logger.info(f"Request: {method} {path} - {status_code}", extra=extra)
    
    def log_error(self, request_id: str, error: Exception, context: Dict[str, Any] = None):
        """Log an error"""
        extra = {
            "request_id": request_id,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context or {}
        }
        self.logger.error(f"Error: {type(error).__name__}: {str(error)}", extra=extra)

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)
request_logger = RequestLogger()

# Test logging
logger.info("Logging system initialized")
