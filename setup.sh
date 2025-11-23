#!/bin/bash

# Tough Chat Setup Script
# This script helps you set up the Tough Chat application quickly

set -e

echo "🚀 Tough Chat Setup Script"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo -e "${BLUE}Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python 3 is not installed. Please install Python 3.11+ first.${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✓ ${PYTHON_VERSION} found${NC}"
echo ""

# Check Node.js for frontend
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
echo ""

# Backend Setup (Python)
echo -e "${BLUE}Setting up Python Backend...${NC}"
cd tough/tough-backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
else
    echo -e "${YELLOW}requirements.txt not found!${NC}"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit tough/tough-backend/.env with your API keys!${NC}"
fi

# Deactivate virtual environment
deactivate

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Frontend Setup
echo -e "${BLUE}Setting up Frontend...${NC}"
cd ../front-end

if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}Frontend package.json not found!${NC}"
    exit 1
fi

echo "Installing frontend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        echo "VITE_API_URL=http://localhost:3001/api" > .env
    fi
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

cd ../..

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Configure your API keys in tough/tough-backend/.env"
echo "   - Add at least one AI provider key (GROQ, OpenAI, etc.)"
echo "   - Add Google OAuth credentials (see SETUP.md)"
echo ""
echo "2. Start the backend:"
echo "   cd tough/tough-backend"
echo "   source venv/bin/activate"
echo "   python -m src.app"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd tough/front-end && npm run dev"
echo ""
echo "4. Open your browser to http://localhost:5173"
echo ""
echo -e "${BLUE}📖 For detailed instructions, see SETUP.md${NC}"
echo ""
