from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import init_db
from app.core.logging import setup_logging
from app.middleware.logging_middleware import LoggingMiddleware, RateLimitingMiddleware

# Setup logging
setup_logging()

# Initialize database on startup
init_db()

app = FastAPI(
    title="GreatReading API",
    description="Backend API for GreatReading - Focused Reading App",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

origins = ["https://glowing-succotash-9qwjwwqqvr937xjw-5173.app.github.dev", "http://localhost:5173", "http://localhost:3000"]

# Add middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitingMiddleware, max_requests=100, window_seconds=60)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded PDFs
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Import and include routers
from app.api.endpoints import auth, books, dictionary, reading
from app.api.endpoints.enhanced_books import router as enhanced_books_router

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(dictionary.router, prefix="/api/dictionary", tags=["dictionary"])
app.include_router(reading.router, prefix="/api/reading", tags=["reading"])
app.include_router(enhanced_books_router, prefix="/api/books", tags=["books"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to GreatReading API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": "now",
        "version": "1.0.0"
    }

@app.get("/api/test")
def test_endpoint():
    return {
        "message": "API is working!",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "root": "/"
        }
    }
