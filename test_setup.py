import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import init_db
from app.core.config import settings

print("Testing GreatReading Backend Setup...")
print(f"Database URL: {settings.DATABASE_URL}")
print(f"Upload Directory: {settings.UPLOAD_DIR}")

try:
    init_db()
    print("✅ Database initialized successfully!")
    
    # Check if upload directory exists
    if os.path.exists(settings.UPLOAD_DIR):
        print(f"✅ Upload directory exists at: {settings.UPLOAD_DIR}")
    else:
        print(f"❌ Upload directory not found at: {settings.UPLOAD_DIR}")
        
except Exception as e:
    print(f"❌ Error during setup: {e}")
    sys.exit(1)

print("\n✅ Setup completed successfully!")
print("\nNext steps:")
print("1. Run backend: python run.py")
print("2. Run frontend: cd ../frontend && npm run dev")
print("3. Visit: http://localhost:5173")
