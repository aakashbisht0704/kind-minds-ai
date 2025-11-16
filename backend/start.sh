#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting KindMinds Backend Server...${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}Virtual environment not found! Please run: python -m venv venv${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}.env file not found! Please create one with GROQ_API_KEY${NC}"
    exit 1
fi

# Kill any existing process on port 8000
echo -e "${BLUE}Checking for existing processes on port 8000...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}Killed existing process${NC}"

# Activate virtual environment and start server
echo -e "${GREEN}Activating virtual environment...${NC}"
source venv/bin/activate

echo -e "${GREEN}Starting FastAPI server on http://localhost:8000${NC}"
python main.py

