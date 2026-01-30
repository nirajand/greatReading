from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.models.dictionary import DictionaryEntry
from app.schemas.dictionary import (
    DictionaryEntry as DictionaryEntrySchema,
    DictionaryEntryCreate,
    DictionaryEntryUpdate,
    WordLookup
)
from app.services.dictionary_service import DictionaryService

router = APIRouter()

@router.post("/lookup/{word}", response_model=WordLookup)
async def lookup_word(
    word: str,
    current_user: User = Depends(get_current_active_user)
):
    """Look up word definition from external API"""
    service = DictionaryService()
    word_data = await service.lookup_word(word)
    
    if not word_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No definition found for '{word}'"
        )
    
    formatted_data = service.format_definition(word_data)
    return formatted_data

@router.post("/", response_model=DictionaryEntrySchema)
async def create_dictionary_entry(
    entry_in: DictionaryEntryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save word to personal dictionary"""
    # Check if word already exists for user
    existing_entry = db.query(DictionaryEntry).filter(
        DictionaryEntry.user_id == current_user.id,
        DictionaryEntry.word == entry_in.word
    ).first()
    
    if existing_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Word already in dictionary"
        )
    
    # If no definition provided, look it up
    if not entry_in.definition:
        service = DictionaryService()
        word_data = await service.lookup_word(entry_in.word)
        
        if word_data:
            formatted_data = service.format_definition(word_data)
            if formatted_data.get("meanings"):
                # Use first definition from first meaning
                first_meaning = formatted_data["meanings"][0]
                if first_meaning.get("definitions"):
                    entry_in.definition = first_meaning["definitions"][0].get("definition", "")
                
                entry_in.part_of_speech = first_meaning.get("partOfSpeech", "")
    
    # Create entry
    db_entry = DictionaryEntry(
        user_id=current_user.id,
        word=entry_in.word,
        definition=entry_in.definition,
        context=entry_in.context,
        book_id=entry_in.book_id,
        page_number=entry_in.page_number,
        phonetic=entry_in.phonetic,
        audio_url=entry_in.audio_url,
        part_of_speech=entry_in.part_of_speech,
        examples=entry_in.examples or []
    )
    
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return db_entry

@router.get("/", response_model=List[DictionaryEntrySchema])
def list_dictionary_entries(
    skip: int = 0,
    limit: int = 100,
    mastered: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List dictionary entries for current user"""
    query = db.query(DictionaryEntry).filter(
        DictionaryEntry.user_id == current_user.id
    )
    
    if mastered is not None:
        query = query.filter(DictionaryEntry.mastered == mastered)
    
    entries = query.order_by(
        DictionaryEntry.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return entries

@router.get("/{entry_id}", response_model=DictionaryEntrySchema)
def get_dictionary_entry(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get dictionary entry by ID"""
    entry = db.query(DictionaryEntry).filter(
        DictionaryEntry.id == entry_id,
        DictionaryEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dictionary entry not found"
        )
    
    return entry

@router.put("/{entry_id}", response_model=DictionaryEntrySchema)
def update_dictionary_entry(
    entry_id: int,
    entry_update: DictionaryEntryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update dictionary entry (e.g., mastery level)"""
    entry = db.query(DictionaryEntry).filter(
        DictionaryEntry.id == entry_id,
        DictionaryEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dictionary entry not found"
        )
    
    # Update fields
    update_data = entry_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)
    
    db.commit()
    db.refresh(entry)
    
    return entry

@router.delete("/{entry_id}")
def delete_dictionary_entry(
    entry_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete dictionary entry"""
    entry = db.query(DictionaryEntry).filter(
        DictionaryEntry.id == entry_id,
        DictionaryEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dictionary entry not found"
        )
    
    db.delete(entry)
    db.commit()
    
    return {"message": "Dictionary entry deleted successfully"}
