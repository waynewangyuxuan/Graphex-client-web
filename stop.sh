#!/bin/bash

# stop.sh - Stop the Graphex frontend service
# Gracefully shuts down the Next.js dev server

set -e  # Exit on error

echo "🛑 Stopping Graphex Frontend..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Next.js dev server is running
if pgrep -f "next dev" > /dev/null; then
    echo "   Found running Next.js dev server"

    # Kill the process
    pkill -f "next dev"

    # Wait for process to stop
    sleep 2

    # Verify it stopped
    if pgrep -f "next dev" > /dev/null; then
        echo -e "${YELLOW}⚠️  Process still running, forcing shutdown...${NC}"
        pkill -9 -f "next dev"
        sleep 1
    fi

    echo -e "${GREEN}✓${NC} Frontend service stopped"
else
    echo -e "${YELLOW}ℹ️  No running frontend service found${NC}"
fi

# Check if port 3000 is still in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo ""
    echo -e "${YELLOW}⚠️  Port 3000 still in use by another process${NC}"
    echo "   Killing process on port 3000..."

    lsof -ti:3000 | xargs kill -9 || true
    sleep 1

    echo -e "${GREEN}✓${NC} Port 3000 freed"
fi

echo ""
echo -e "${GREEN}✨ All frontend services stopped${NC}"
echo ""
