#!/bin/bash

echo "🎯 Complete GreatReading Setup"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}🔍 Checking prerequisites...${NC}"

if command_exists python3 && python3 --version | grep -q "3.1[1-9]\|3.[2-9][0-9]"; then
    echo -e "${GREEN}✅ Python 3.11+ found${NC}"
else
    echo -e "${RED}❌ Python 3.11+ required${NC}"
    exit 1
fi

if command_exists node && node --version | grep -q "v18\|v19\|v20"; then
    echo -e "${GREEN}✅ Node.js 18+ found${NC}"
else
    echo -e "${RED}❌ Node.js 18+ required${NC}"
    exit 1
fi

if command_exists npm; then
    echo -e "${GREEN}✅ npm found${NC}"
else
    echo -e "${RED}❌ npm required${NC}"
    exit 1
fi

# Setup Backend
echo -e "\n${YELLOW}📦 Setting up Backend...${NC}"

cd /workspaces/greatReading/backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install pytest pytest-cov httpx python-magic
print_status "Backend dependencies installed"

# Create necessary directories
mkdir -p logs uploads
print_status "Directories created"

# Initialize database
python -c "
import sys
sys.path.append('.')
from app.core.database import init_db
init_db()
print('Database initialized')
"
print_status "Database initialized"

# Setup Frontend
echo -e "\n${YELLOW}🎨 Setting up Frontend...${NC}"

cd /workspaces/greatReading/frontend

# Install dependencies
npm install
print_status "Frontend dependencies installed"

# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest @vitest/ui jsdom
print_status "Test dependencies installed"

# Make scripts executable
cd /workspaces/greatReading
chmod +x start-all.sh run-tests.sh setup-complete.sh
print_status "Scripts made executable"

# Run tests
echo -e "\n${YELLOW}🧪 Running initial tests...${NC}"
./run-tests.sh

# Final message
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}🚀 To start the application:${NC}"
echo -e "  ./start-all.sh"
echo -e "\n${YELLOW}🧪 To run tests:${NC}"
echo -e "  ./run-tests.sh"
echo -e "\n${YELLOW}🌐 Access Points:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "  API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "\n${YELLOW}📚 Documentation:${NC}"
echo -e "  See README.md for detailed instructions"
echo -e "${GREEN}========================================${NC}"
