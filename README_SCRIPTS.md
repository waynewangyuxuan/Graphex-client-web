# Frontend Service Scripts

Quick start/stop scripts for managing the Graphex frontend development server.

## Usage

### Start Frontend

```bash
./start.sh
```

**What it does:**
1. Checks for existing Next.js dev server and kills it
2. Frees port 3000 if it's in use
3. Clears Next.js cache (`.next` folder)
4. Validates `.env.local` exists
5. Displays current configuration
6. Starts fresh dev server on port 3000

**Output:**
```
🚀 Starting Graphex Frontend...

🧹 Clearing Next.js cache...
✓ Cache cleared

📋 Configuration:
   API URL: http://localhost:4000/api/v1
   MSW Enabled: false

🎬 Starting frontend service...
   Local:   http://localhost:3000
   Network: http://192.168.1.100:3000

Press Ctrl+C to stop the server
```

### Stop Frontend

```bash
./stop.sh
```

**What it does:**
1. Finds all running Next.js dev servers
2. Gracefully stops them (SIGTERM)
3. Force kills if needed (SIGKILL)
4. Frees port 3000 if still in use
5. Confirms shutdown

**Output:**
```
🛑 Stopping Graphex Frontend...

   Found running Next.js dev server
✓ Frontend service stopped

✨ All frontend services stopped
```

## Troubleshooting

### Script Permission Denied

```bash
chmod +x start.sh stop.sh
```

### Port 3000 Already in Use

The `start.sh` script automatically handles this, but you can manually free it:

```bash
lsof -ti:3000 | xargs kill -9
```

### Multiple Next.js Processes

```bash
pkill -9 -f "next dev"
```

### Script Not Found

Make sure you're in the project directory:

```bash
cd /path/to/Graphex-client-web
./start.sh
```

## Integration with Backend

### Start Both Services

```bash
# Terminal 1 - Backend
cd ../Graphex-server
npm run dev

# Terminal 2 - Frontend
cd ../Graphex-client-web
./start.sh
```

### Stop Both Services

```bash
# Frontend
./stop.sh

# Backend (in backend directory)
pkill -f "tsx"
```

## Script Details

### start.sh Features

- ✅ Auto-cleanup of existing processes
- ✅ Port conflict resolution
- ✅ Cache clearing for fresh start
- ✅ Environment validation
- ✅ Configuration display
- ✅ Network access URL shown
- ✅ Colored output for clarity

### stop.sh Features

- ✅ Graceful shutdown attempt
- ✅ Force kill fallback
- ✅ Port cleanup verification
- ✅ Status confirmation
- ✅ Works even if service not running

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_MSW_ENABLED=false
NODE_ENV=development
```

The `start.sh` script validates these exist before starting.

## Common Workflows

### Fresh Start (Clear Everything)

```bash
./stop.sh
rm -rf node_modules .next
pnpm install
./start.sh
```

### Quick Restart

```bash
./stop.sh && ./start.sh
```

### Check What's Running

```bash
# Check for Next.js processes
pgrep -f "next dev"

# Check port 3000
lsof -i :3000
```

---

**Pro Tip**: Add these to your shell aliases:

```bash
# Add to ~/.zshrc or ~/.bashrc
alias gx-start="cd /path/to/Graphex-client-web && ./start.sh"
alias gx-stop="cd /path/to/Graphex-client-web && ./stop.sh"
alias gx-restart="cd /path/to/Graphex-client-web && ./stop.sh && ./start.sh"
```

Then use:
```bash
gx-start    # Start frontend from anywhere
gx-stop     # Stop frontend from anywhere
gx-restart  # Restart frontend from anywhere
```
