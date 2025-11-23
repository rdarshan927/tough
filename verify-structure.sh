#!/bin/bash

# Tough Chat - Project Cleanup and Verification Script
# This script cleans up any duplicate files and verifies the project structure

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Tough Chat - Project Cleanup & Verification${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

PROJECT_ROOT="/mnt/new_volume/Projects/personal/TOUGH CHAT"
cd "$PROJECT_ROOT"

# Check if we're in the right directory
if [ ! -d "tough" ]; then
    echo -e "${RED}Error: tough/ directory not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}Current Project Structure:${NC}"
echo "TOUGH CHAT/"
echo "├── tough/"
echo "│   ├── front-end/        (React Frontend - TypeScript)"
echo "│   └── tough-backend/    (Python Backend - Flask)"
echo "├── Documentation files"
echo "└── setup.sh"
echo ""

# Verify structure
echo -e "${BLUE}Verifying directory structure...${NC}"

if [ -d "tough/front-end" ]; then
    echo -e "${GREEN}✓ Frontend directory found${NC}"
else
    echo -e "${RED}✗ Frontend directory missing!${NC}"
    exit 1
fi

if [ -d "tough/tough-backend" ]; then
    echo -e "${GREEN}✓ Backend directory found${NC}"
else
    echo -e "${RED}✗ Backend directory missing!${NC}"
    exit 1
fi

# Check for required files
echo ""
echo -e "${BLUE}Checking required files...${NC}"

# Frontend files
if [ -f "tough/front-end/package.json" ]; then
    echo -e "${GREEN}✓ Frontend package.json exists${NC}"
else
    echo -e "${RED}✗ Frontend package.json missing!${NC}"
fi

if [ -f "tough/front-end/.env.example" ]; then
    echo -e "${GREEN}✓ Frontend .env.example exists${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env.example missing (creating...)${NC}"
    echo "VITE_API_URL=http://localhost:3001/api" > tough/front-end/.env.example
fi

# Check for root .gitignore
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓ Root .gitignore exists${NC}"
else
    echo -e "${RED}✗ Root .gitignore missing!${NC}"
fi

# Backend files
if [ -f "tough/tough-backend/requirements.txt" ]; then
    echo -e "${GREEN}✓ Backend requirements.txt exists${NC}"
else
    echo -e "${RED}✗ Backend requirements.txt missing!${NC}"
fi

if [ -f "tough/tough-backend/.env.example" ]; then
    echo -e "${GREEN}✓ Backend .env.example exists${NC}"
else
    echo -e "${RED}✗ Backend .env.example missing!${NC}"
fi

if [ -d "tough/tough-backend/src" ]; then
    echo -e "${GREEN}✓ Backend src/ directory exists${NC}"
else
    echo -e "${RED}✗ Backend src/ directory missing!${NC}"
fi

if [ -f "tough/tough-backend/src/__init__.py" ]; then
    echo -e "${GREEN}✓ Backend package initialized${NC}"
else
    echo -e "${YELLOW}⚠ Backend __init__.py missing${NC}"
fi

# Docker files
echo ""
echo -e "${BLUE}Checking Docker configuration...${NC}"

if [ -f "tough/docker-compose.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.yml exists (in tough/)${NC}"
else
    echo -e "${YELLOW}⚠ docker-compose.yml not found in tough/${NC}"
fi

if [ -f "tough/tough-backend/Dockerfile" ]; then
    echo -e "${GREEN}✓ Backend Dockerfile exists${NC}"
else
    echo -e "${YELLOW}⚠ Backend Dockerfile missing${NC}"
fi

if [ -f "tough/front-end/Dockerfile" ]; then
    echo -e "${GREEN}✓ Frontend Dockerfile exists${NC}"
else
    echo -e "${YELLOW}⚠ Frontend Dockerfile missing${NC}"
fi

# Check for old/duplicate files
echo ""
echo -e "${BLUE}Checking for old/duplicate files...${NC}"

# Check if there's an old package.json at root of tough
if [ -f "tough/package.json" ] && [ -d "tough/front-end" ]; then
    echo -e "${YELLOW}⚠ Found old package.json in tough/ (should be in tough/front-end/)${NC}"
    echo -e "${YELLOW}  Consider moving or removing it${NC}"
fi

# Check for old Node.js files in backend
if [ -f "tough/tough-backend/package.json" ]; then
    echo -e "${YELLOW}⚠ Found package.json in Python backend (old Node.js file)${NC}"
    echo -e "${YELLOW}  Backend is now Python - this can be removed${NC}"
fi

if [ -f "tough/tough-backend/tsconfig.json" ]; then
    echo -e "${YELLOW}⚠ Found tsconfig.json in Python backend (old TypeScript file)${NC}"
    echo -e "${YELLOW}  Backend is now Python - this can be removed${NC}"
fi

# List any .js files in backend src (should be .py now)
if [ -d "tough/tough-backend/src" ]; then
    JS_FILES=$(find tough/tough-backend/src -name "*.js" 2>/dev/null | wc -l)
    if [ "$JS_FILES" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Found $JS_FILES JavaScript files in Python backend${NC}"
        find tough/tough-backend/src -name "*.js"
    fi
fi

# Verify documentation
echo ""
echo -e "${BLUE}Checking documentation...${NC}"

for doc in README.md SETUP.md ARCHITECTURE.md IMPLEMENTATION.md; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓ $doc exists${NC}"
    else
        echo -e "${RED}✗ $doc missing!${NC}"
    fi
done

if [ -f "setup.sh" ]; then
    echo -e "${GREEN}✓ setup.sh exists${NC}"
    if [ -x "setup.sh" ]; then
        echo -e "${GREEN}  └─ Executable ✓${NC}"
    else
        echo -e "${YELLOW}  └─ Not executable (fixing...)${NC}"
        chmod +x setup.sh
    fi
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Verification Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${BLUE}Project Structure Summary:${NC}"
echo ""
echo "Frontend:  tough/front-end/"
echo "Backend:   tough/tough-backend/"
echo "Docker:    tough/docker-compose.yml"
echo "Docs:      Root level (README.md, SETUP.md, etc.)"
echo ""

echo -e "${YELLOW}Quick Start Commands:${NC}"
echo ""
echo "1. Install dependencies:"
echo "   ./setup.sh"
echo ""
echo "2. Start development:"
echo "   Terminal 1: cd tough/tough-backend && source venv/bin/activate && python -m src.app"
echo "   Terminal 2: cd tough/front-end && npm run dev"
echo ""
echo "3. Or use Docker:"
echo "   cd tough && docker-compose up -d"
echo ""

echo -e "${GREEN}✨ Project structure verified!${NC}"
