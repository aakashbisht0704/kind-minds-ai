#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting KindMinds Development Servers...${NC}"

# Start Python backend in background
echo -e "${GREEN}Starting Python backend on port 8000...${NC}"

# Kill any existing process on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start Next.js frontend
echo -e "${GREEN}Starting Next.js frontend...${NC}"
npm run dev &
FRONTEND_PID=$!

echo -e "${BLUE}Both servers are running!${NC}"
echo -e "Backend: http://localhost:8000"
echo -e "Frontend: http://localhost:3000"
echo -e ""
echo -e "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Wait for processes
wait

