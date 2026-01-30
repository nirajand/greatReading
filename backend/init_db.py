"""
Initialize the database and create all tables.
"""
import os
import sys

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    print("="*60)
    print("Initializing GreatReading Database")
    print("="*60)
    
    try:
        from app.core.config import settings
        from app.core.database import init_db
        
        print(f"\n📊 Configuration:")
        print(f"   Database: {settings.DATABASE_URL}")
        print(f"   Upload directory: {settings.UPLOAD_DIR}")
        
        # Ensure upload directory exists
        if not os.path.exists(settings.UPLOAD_DIR):
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            print(f"   ✅ Created upload directory")
        
        # Initialize database
        print(f"\n🛠️  Creating database tables...")
        init_db()
        
        print(f"\n" + "="*60)
        print("✅ Database initialized successfully!")
        print("="*60)
        
        # Show created tables
        print("\n📋 Database tables created:")
        if settings.DATABASE_URL.startswith("sqlite"):
            import sqlite3
            db_file = settings.DATABASE_URL.replace("sqlite:///./", "")
            if os.path.exists(db_file):
                conn = sqlite3.connect(db_file)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                for table in tables:
                    print(f"   • {table[0]}")
                conn.close()
        
        print(f"\n🚀 You can now start the application with:")
        print(f"   uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
