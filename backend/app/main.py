from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import init_db

# Initialize database on startup
init_db()

app = FastAPI(
    title="GreatReading API",
    description="Backend API for GreatReading - Focused Reading App",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded PDFs
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

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
    return {"status": "healthy", "database": "connected"}

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
