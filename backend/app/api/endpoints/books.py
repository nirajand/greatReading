import os, aiofiles, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Form, status
from sqlalchemy.orm import Session
from pypdf import PdfReader
from app.api.deps import get_db, get_current_active_user
from app.models.book import Book as BookModel

router = APIRouter()
UPLOAD_DIR = "storage/pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_pdf(book_id: int, db: Session):
    book = db.query(BookModel).filter(BookModel.id == book_id).first()
    if not book:
        return
    try:
        reader = PdfReader(book.file_path)
        book.total_pages = len(reader.pages)
        book.status = "completed"
    except Exception as e:
        print(f"Error processing PDF: {e}")
        book.status = "failed"
    finally:
        db.commit()

@router.post("/upload")
async def upload_book(
    background_tasks: BackgroundTasks,
    title: str = Form(None),
    author: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are allowed")

    # If title is not provided, use the filename without extension
    final_title = title if title else file.filename.rsplit('.', 1)[0]
    
    unique_fn = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, unique_fn)
    
    # Save file asynchronously
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())

    db_book = BookModel(
        title=final_title,
        author=author,
        filename=unique_fn, 
        file_path=path, 
        owner_id=current_user.id,
        status="processing",
        total_pages=0
    )
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    
    background_tasks.add_task(process_pdf, db_book.id, db)
    
    return {
        "id": db_book.id, 
        "title": db_book.title, 
        "author": db_book.author,
        "file_path": db_book.file_path, 
        "file_name": db_book.filename,
        "total_pages": db_book.total_pages, 
        "current_page": 0, 
        "progress": 0.0,
        "status": db_book.status
    }

@router.get("/")
def list_books(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return db.query(BookModel).filter(BookModel.owner_id == current_user.id).all()

@router.get("/{book_id}")
def get_book(book_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    book = db.query(BookModel).filter(BookModel.id == book_id, BookModel.owner_id == current_user.id).first()
    if not book: raise HTTPException(404, "Book not found")
    return book

@router.put("/{book_id}")
def update_book(book_id: int, data: dict, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    book = db.query(BookModel).filter(BookModel.id == book_id, BookModel.owner_id == current_user.id).first()
    if not book: raise HTTPException(404, "Book not found")
    for key, val in data.items(): setattr(book, key, val)
    db.commit()
    return book

@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    book = db.query(BookModel).filter(BookModel.id == book_id, BookModel.owner_id == current_user.id).first()
    if not book: raise HTTPException(404, "Book not found")
    
    # Clean up file from storage
    if os.path.exists(book.file_path):
        os.remove(book.file_path)
        
    db.delete(book)
    db.commit()
    return {"status": "success"}

@router.get("/{book_id}/page/{page_num}")
def get_page_text(book_id: int, page_num: int):
    return {"text": "Sample page content", "page_number": page_num}