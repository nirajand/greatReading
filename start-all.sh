#!/bin/bash

echo "🚀 Starting GreatReading Application"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM


cd frontend && npm install


# Start Backend
echo -e "\n${YELLOW}📦 Starting Backend...${NC}"
cd /workspaces/greatReading/backend

if check_port 8000; then
    echo -e "${YELLOW}⚠️ Port 8000 already in use${NC}"
else
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
fi

# Wait for backend to start
echo "Waiting for backend to be ready..."
sleep 3

# Start Frontend
echo -e "\n${YELLOW}🎨 Starting Frontend...${NC}"
cd /workspaces/greatReading/frontend

if check_port 5173; then
    echo -e "${YELLOW}⚠️ Port 5173 already in use${NC}"
else
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
fi

# Wait for frontend to start
echo "Waiting for frontend to be ready..."
sleep 5

# Display information
echo -e "\n${GREEN}====================================${NC}"
echo -e "${GREEN}🚀 GreatReading is running!${NC}"
echo -e "${GREEN}====================================${NC}"
echo -e "\n${YELLOW}🌐 Access Points:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "  API Documentation: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "  Health Check: ${GREEN}http://localhost:8000/health${NC}"
echo -e "\n${YELLOW}📊 Test Reports:${NC}"
echo -e "  Backend Tests: ${GREEN}cd backend && pytest${NC}"
echo -e "  Frontend Tests: ${GREEN}cd frontend && npm test${NC}"
echo -e "\n${YELLOW}📝 Logs:${NC}"
echo -e "  Backend Logs: ${GREEN}tail -f backend/logs/*.log${NC}"
echo -e "  Frontend Logs: ${GREEN}Check browser console${NC}"
echo -e "\n${YELLOW}🛠️ Development:${NC}"
echo -e "  Backend hot reload: ${GREEN}Enabled${NC}"
echo -e "  Frontend hot reload: ${GREEN}Enabled${NC}"
echo -e "\n${RED}Press Ctrl+C to stop both servers${NC}"

# Monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "\n${RED}❌ Backend process died${NC}"
        cleanup
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "\n${RED}❌ Frontend process died${NC}"
        cleanup
    fi
    
    sleep 5
done
