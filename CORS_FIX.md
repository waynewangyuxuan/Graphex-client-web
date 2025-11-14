# CORS Error Fix Guide

## The Problem

You're seeing this error in the browser console:

```
Access to XMLHttpRequest at 'http://localhost:4000/api/v1/documents'
from origin 'http://localhost:3000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This means your **backend** needs to allow requests from the frontend.

---

## The Solution

### Step 1: Update Backend CORS Configuration

Go to your **backend** project directory and update the CORS middleware:

```bash
cd ../Graphex-server  # Or wherever your backend is located
```

Find and edit `src/middleware/cors.middleware.ts`:

```typescript
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3000',        // Frontend dev server - ADD THIS!
    'http://100.64.40.181:3000',   // Network access (optional)
    // ... any other origins you had
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
};

export const corsMiddleware = cors(corsOptions);
```

### Step 2: Apply CORS Middleware in Server

Make sure it's applied **before** your routes in `src/app.ts` or `src/server.ts`:

```typescript
import express from 'express';
import { corsMiddleware } from './middleware/cors.middleware';

const app = express();

// CORS must be one of the first middlewares
app.use(corsMiddleware);

// Then your other middlewares and routes
app.use(express.json());
app.use('/api/v1', apiRoutes);

// ... rest of your server setup
```

### Step 3: Restart Backend Server

```bash
# Stop current backend (Ctrl+C)
# Then start again
npm run dev
```

### Step 4: Verify CORS Headers

Test with curl to verify the CORS headers are present:

```bash
curl -I -X OPTIONS http://localhost:4000/api/v1/documents \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
```

You should see:
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Credentials: true
```

### Step 5: Test Frontend Upload

Now try uploading a file from the frontend:

1. Go to http://localhost:3000
2. Select a PDF or text file
3. Click "Upload Document"
4. It should work without CORS errors!

---

## Alternative: Quick Fix for Development

If you want to allow **all origins** during development (NOT recommended for production):

```typescript
const corsOptions = {
  origin: true,  // Allow all origins - DEV ONLY!
  credentials: true,
};
```

**⚠️ WARNING**: This is insecure for production. Only use for local development.

---

## Common Issues

### Issue: Still Getting CORS Error After Update

**Fix:**
1. Make sure you **restarted the backend** after changing CORS config
2. Clear your browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+F5 on Windows)
3. Check backend console logs - CORS errors are logged there too

### Issue: CORS Headers Not Showing Up

**Possible Causes:**
- CORS middleware not applied
- CORS middleware applied after routes (move it before)
- Backend crashed (check backend console)

**Debug:**
```bash
# Check if backend is running
curl http://localhost:4000/health

# Check CORS specifically
curl -I http://localhost:4000/api/v1/documents \
  -H "Origin: http://localhost:3000"
```

### Issue: Preflight OPTIONS Request Failing

**Fix:** Make sure OPTIONS method is handled:

```typescript
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
```

---

## Understanding CORS

**What is CORS?**
- Cross-Origin Resource Sharing
- Browser security feature
- Prevents websites from making requests to different domains without permission

**Why do we need it?**
- Frontend: `http://localhost:3000` (domain 1)
- Backend: `http://localhost:4000` (domain 2)
- Browser blocks cross-domain requests by default
- Backend must explicitly allow it

**How it works:**
1. Browser sends OPTIONS request first (preflight)
2. Backend responds with allowed origins
3. If origin is allowed, browser sends actual request
4. If not allowed, browser blocks it

---

## Verification Checklist

Before testing, verify:

- [ ] Backend CORS middleware includes `http://localhost:3000`
- [ ] CORS middleware is applied before routes
- [ ] Backend server has been restarted
- [ ] Backend is running on port 4000
- [ ] Frontend is running on port 3000
- [ ] No other errors in backend console

---

## Backend Log Confirmation

When properly configured, your backend should log:

```
[info]: CORS enabled for origins: http://localhost:3000
[info]: Server running on http://localhost:4000
```

---

## Quick Test Command

Run this from your frontend directory to test the full flow:

```bash
# 1. Start backend (Terminal 1)
cd ../Graphex-server
npm run dev

# 2. Start frontend (Terminal 2)
cd ../Graphex-client-web
./start.sh

# 3. Test upload (Terminal 3)
curl -X POST http://localhost:4000/api/v1/documents \
  -F "file=@/path/to/test.pdf" \
  -F "title=Test Document" \
  -H "Origin: http://localhost:3000"
```

If curl succeeds, the frontend will work too!

---

## Still Not Working?

If you're still seeing CORS errors after following all steps:

1. **Share your backend CORS configuration** - I'll review it
2. **Check backend console logs** - Copy any CORS-related errors
3. **Verify both servers are running**:
   ```bash
   # Frontend should show:
   curl http://localhost:3000

   # Backend should show:
   curl http://localhost:4000/health
   ```

---

**Version**: 1.0
**Last Updated**: 2025-11-14
**Related**: [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)
