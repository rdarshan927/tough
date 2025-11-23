#!/bin/bash

# Cleanup Optional Duplicate Files
# These files are not causing errors but are redundant

set -e

PROJECT_ROOT="/mnt/new_volume/Projects/personal/TOUGH CHAT"
cd "$PROJECT_ROOT"

echo "🧹 Cleaning up optional duplicate files..."
echo ""

# Track if anything was removed
CLEANED=0

# Remove old frontend docker-compose (we use tough/docker-compose.yml now)
if [ -f "tough/front-end/docker-compose.yml" ]; then
    echo "📋 Removing: tough/front-end/docker-compose.yml"
    echo "   Reason: Standalone frontend docker-compose (old)"
    echo "   Use Instead: tough/docker-compose.yml (orchestrates both services)"
    rm "tough/front-end/docker-compose.yml"
    echo "   ✅ Removed"
    echo ""
    CLEANED=$((CLEANED + 1))
fi

# Remove root .env.example (each service has its own)
if [ -f "tough/.env.example" ]; then
    echo "📋 Removing: tough/.env.example"
    echo "   Reason: Each service has its own .env.example"
    echo "   Frontend: tough/front-end/.env.example"
    echo "   Backend: tough/tough-backend/.env.example"
    rm "tough/.env.example"
    echo "   ✅ Removed"
    echo ""
    CLEANED=$((CLEANED + 1))
fi

# Summary
echo "========================================="
if [ $CLEANED -gt 0 ]; then
    echo "✅ Cleanup complete! Removed $CLEANED duplicate file(s)"
else
    echo "✅ No duplicate files found - project already clean!"
fi
echo "========================================="
echo ""

# Verify structure still intact
if [ -f "./verify-structure.sh" ]; then
    echo "Running structure verification..."
    echo ""
    ./verify-structure.sh
fi
