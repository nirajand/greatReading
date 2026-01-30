from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.models.reading_session import ReadingSession
from app.models.book import Book
from app.schemas.reading_session import (
    ReadingSession as ReadingSessionSchema,
    ReadingSessionCreate,
    ReadingSessionUpdate,
    ReadingStats
)

router = APIRouter()

@router.post("/session", response_model=ReadingSessionSchema)
def create_reading_session(
    session_in: ReadingSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Start a new reading session"""
    # Verify book belongs to user
    book = db.query(Book).filter(
        Book.id == session_in.book_id,
        Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Create session
    db_session = ReadingSession(
        user_id=current_user.id,
        book_id=session_in.book_id,
        duration_minutes=session_in.duration_minutes,
        start_page=session_in.start_page,
        end_page=session_in.end_page
    )
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return db_session

@router.put("/session/{session_id}", response_model=ReadingSessionSchema)
def update_reading_session(
    session_id: int,
    session_update: ReadingSessionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update reading session (end it)"""
    session = db.query(ReadingSession).filter(
        ReadingSession.id == session_id,
        ReadingSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reading session not found"
        )
    
    # Update fields
    update_data = session_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)
    
    # Update book progress if end_page is provided
    if session_update.end_page:
        book = db.query(Book).filter(
            Book.id == session.book_id,
            Book.user_id == current_user.id
        ).first()
        
        if book and book.total_pages > 0:
            book.current_page = session_update.end_page
            book.progress = min(100.0, (session_update.end_page / book.total_pages) * 100)
    
    db.commit()
    db.refresh(session)
    
    return session

@router.get("/sessions", response_model=List[ReadingSessionSchema])
def list_reading_sessions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List reading sessions for current user"""
    sessions = db.query(ReadingSession).filter(
        ReadingSession.user_id == current_user.id
    ).order_by(
        ReadingSession.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return sessions

@router.get("/stats", response_model=ReadingStats)
def get_reading_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get reading statistics"""
    # Total sessions and minutes
    sessions = db.query(ReadingSession).filter(
        ReadingSession.user_id == current_user.id
    ).all()
    
    total_sessions = len(sessions)
    total_minutes = sum(session.duration_minutes for session in sessions)
    
    # Total books
    total_books = db.query(Book).filter(
        Book.user_id == current_user.id
    ).count()
    
    # Total words saved
    total_words_saved = db.query(ReadingSession).filter(
        ReadingSession.user_id == current_user.id
    ).with_entities(
        db.func.sum(ReadingSession.words_saved)
    ).scalar() or 0
    
    # Average session length
    average_session_length = total_minutes / total_sessions if total_sessions > 0 else 0
    
    # Favorite reading time (simplified)
    favorite_reading_time = None
    if sessions:
        # Count sessions by hour
        hour_counts = {}
        for session in sessions:
            hour = session.created_at.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        if hour_counts:
            favorite_hour = max(hour_counts.items(), key=lambda x: x[1])[0]
            favorite_reading_time = f"{favorite_hour:02d}:00"
    
    return ReadingStats(
        total_sessions=total_sessions,
        total_minutes=total_minutes,
        total_books=total_books,
        total_words_saved=total_words_saved,
        average_session_length=round(average_session_length, 1),
        favorite_reading_time=favorite_reading_time
    )

@router.get("/timer/presets")
def get_timer_presets():
    """Get available timer presets"""
    return [
        {"minutes": 5, "label": "Quick Read"},
        {"minutes": 10, "label": "Focused Session"},
        {"minutes": 15, "label": "Deep Dive"}
    ]