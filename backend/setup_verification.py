import os
import sys
import subprocess

def check_backend():
    print("🔍 Checking Backend Setup...")
    
    # Check virtual environment
    if not os.path.exists("venv"):
        print("❌ Virtual environment not found. Run: python -m venv venv")
        return False
    print("✅ Virtual environment exists")
    
    # Check requirements
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found")
        return False
    print("✅ requirements.txt exists")
    
    # Check .env file
    if not os.path.exists(".env"):
        print("❌ .env file not found. Creating default...")
        with open(".env", "w") as f:
            f.write("""DATABASE_URL=sqlite:///./greatreading.db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=104857600
DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2/entries/en
FRONTEND_URL=http://localhost:5173""")
        print("✅ Created .env file")
    else:
        print("✅ .env file exists")
    
    # Check uploads directory
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
        print("✅ Created uploads directory")
    else:
        print("✅ uploads directory exists")
    
    return True

def check_frontend():
    print("\n🔍 Checking Frontend Setup...")
    
    # Check if frontend directory exists
    if not os.path.exists("../frontend"):
        print("❌ frontend directory not found")
        return False
    print("✅ frontend directory exists")
    
    # Check package.json
    if not os.path.exists("../frontend/package.json"):
        print("❌ package.json not found")
        return False
    print("✅ package.json exists")
    
    # Check node_modules
    if not os.path.exists("../frontend/node_modules"):
        print("⚠️ node_modules not found. Run: npm install")
        return False
    print("✅ node_modules exists")
    
    return True

def main():
    print("🚀 GreatReading Setup Verification")
    print("=" * 40)
    
    backend_ok = check_backend()
    frontend_ok = check_frontend()
    
    print("\n" + "=" * 40)
    if backend_ok and frontend_ok:
        print("✅ Setup verification completed!")
        print("\nTo run the application:")
        print("1. Start backend: cd backend && python run.py")
        print("2. Start frontend: cd frontend && npm run dev")
        print("\nAccess the app at: http://localhost:5173")
    else:
        print("❌ Setup issues detected. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
