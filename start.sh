#!/bin/bash

# start.sh - Start the Graphex frontend service
# Kills any existing Next.js dev server and starts a fresh instance

set -e  # Exit on error

echo "🚀 Starting Graphex Frontend..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Next.js dev server is already running
if pgrep -f "next dev" > /dev/null; then
    echo -e "${YELLOW}⚠️  Existing frontend service detected${NC}"
    echo "   Stopping existing process..."

    # Kill existing Next.js dev server
    pkill -f "next dev" || true

    # Wait a moment for the process to fully stop
    sleep 2

    echo -e "${GREEN}✓${NC} Stopped existing service"
    echo ""
fi

# Check if port 3000 is in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use${NC}"
    echo "   Killing process on port 3000..."

    # Kill process on port 3000
    lsof -ti:3000 | xargs kill -9 || true

    sleep 1
    echo -e "${GREEN}✓${NC} Freed port 3000"
    echo ""
fi

# Clear Next.js cache for a fresh start
if [ -d ".next" ]; then
    echo "🧹 Clearing Next.js cache..."
    rm -rf .next
    echo -e "${GREEN}✓${NC} Cache cleared"
    echo ""
fi

# Check environment configuration
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ Error: .env.local not found${NC}"
    echo "   Please create .env.local with the following configuration:"
    echo ""
    echo "   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1"
    echo "   NEXT_PUBLIC_MSW_ENABLED=false"
    echo "   NODE_ENV=development"
    echo ""
    exit 1
fi

# Display configuration
echo "📋 Configuration:"
echo "   API URL: $(grep NEXT_PUBLIC_API_URL .env.local | cut -d '=' -f2)"
echo "   MSW Enabled: $(grep NEXT_PUBLIC_MSW_ENABLED .env.local | cut -d '=' -f2)"
echo ""

# Start the frontend service
echo "🎬 Starting frontend service..."
echo "   Local:   http://localhost:3000"
echo "   Network: http://$(ipconfig getifaddr en0 2>/dev/null || echo 'N/A'):3000"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop the server${NC}"
echo ""

# Run pnpm dev
pnpm dev
