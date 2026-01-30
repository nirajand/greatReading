import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging all HTTP requests"""
    
    async def dispatch(self, request: Request, call_next):
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request start
        logger.info(f"Request started: {request.method} {request.url.path} - ID: {request_id}")
        
        # Process request and measure time
        start_time = time.time()
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            
            # Log request completion
            logger.info(f"Request completed: {request.method} {request.url.path} - {response.status_code} - {duration*1000:.2f}ms")
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration*1000:.2f}ms"
            
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Request error: {request.method} {request.url.path} - {str(e)} - {duration*1000:.2f}ms")
            raise

class RateLimitingMiddleware(BaseHTTPMiddleware):
    """Basic rate limiting middleware"""
    
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Clean old entries
        current_time = time.time()
        self.requests = {
            ip: [t for t in times if current_time - t < self.window_seconds]
            for ip, times in self.requests.items()
        }
        
        # Check rate limit
        if client_ip in self.requests:
            recent_requests = self.requests[client_ip]
            if len(recent_requests) >= self.max_requests:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return Response(
                    content="Rate limit exceeded",
                    status_code=429,
                    headers={"Retry-After": str(self.window_seconds)}
                )
        
        # Add current request
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        self.requests[client_ip].append(current_time)
        
        return await call_next(request)
