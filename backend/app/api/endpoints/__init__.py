from .auth import router as auth_router
from .books import router as books_router
from .dictionary import router as dictionary_router
from .reading import router as reading_router

__all__ = ["auth_router", "books_router", "dictionary_router", "reading_router"]