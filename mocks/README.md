# Mock Service Worker (MSW) Setup

This directory contains the complete MSW configuration for the Graphex project, enabling frontend development without a running backend server.

## Overview

Mock Service Worker (MSW) intercepts network requests and provides mock responses based on configured handlers. This allows you to:

- **Develop frontend features** without waiting for backend implementation
- **Test components** with realistic API interactions
- **Simulate edge cases** (errors, slow responses, rate limits)
- **Work offline** without network connectivity

## Files

```
mocks/
├── README.md          # This file
├── data.ts            # Mock data (documents, graphs, quizzes, etc.)
├── handlers.ts        # MSW request handlers for all API endpoints
├── server.ts          # MSW setup for Node.js (Jest tests)
└── browser.ts         # MSW setup for browser (development mode)
```

## Quick Start

### 1. Initialize MSW (One-Time Setup)

Run this command once to generate the service worker file:

```bash
pnpm msw init public/ --save
```

This creates `public/mockServiceWorker.js` which is used by the browser worker.

### 2. Enable/Disable Mocking

MSW is controlled via the `NEXT_PUBLIC_MSW_ENABLED` environment variable in `.env.local`:

```bash
# Enable mocking (default in development)
NEXT_PUBLIC_MSW_ENABLED=true

# Disable mocking (use real backend)
NEXT_PUBLIC_MSW_ENABLED=false
```

### 3. Start Development Server

```bash
pnpm dev
```

You should see these console messages if MSW is enabled:

```
[MSW] Mock Service Worker started successfully
[MSW] API requests will be intercepted and mocked
```

## Usage in Development

When MSW is enabled, all API requests to `http://localhost:3000/api/v1/*` will be intercepted and responded to with mock data.

### Example: Document Upload Flow

```typescript
import { useUploadDocument } from '@/hooks/useUploadDocument';

function UploadComponent() {
  const { mutate: upload } = useUploadDocument();

  const handleUpload = (file: File) => {
    // This will be intercepted by MSW
    upload(file, {
      onSuccess: (data) => {
        console.log('Document uploaded:', data.document.id);
        // MSW returns: { document: { id: 'doc_xyz', ... }, jobId: 'job_abc' }
      },
    });
  };

  return <button onClick={() => handleUpload(file)}>Upload</button>;
}
```

### Example: Polling for Document Status

```typescript
import { useDocumentStatus } from '@/hooks/useDocumentStatus';

function StatusComponent({ documentId }: { documentId: string }) {
  // MSW simulates status transitions: processing -> ready
  const { data } = useDocumentStatus(documentId, {
    refetchInterval: 2000,
  });

  return <div>Status: {data?.status}</div>;
}
```

## Usage in Tests

MSW is automatically configured for Jest tests. Just import the server and set it up in your test files.

### Setup in Test Files

```typescript
// MyComponent.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '@/mocks/server';
import { MyComponent } from './MyComponent';

// Start MSW server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test to prevent test pollution
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

test('should display document data', async () => {
  render(<MyComponent />);

  // MSW will intercept the API call and return mock data
  await waitFor(() => {
    expect(screen.getByText('Active Learning Strategies in Education')).toBeInTheDocument();
  });
});
```

### Overriding Handlers in Tests

You can override handlers for specific test cases:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

test('should display error when document fetch fails', async () => {
  // Override the handler for this test only
  server.use(
    http.get('http://localhost:3000/api/v1/documents/:id', () => {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Document not found',
          },
        },
        { status: 404 }
      );
    })
  );

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText('Document not found')).toBeInTheDocument();
  });
});
```

## Available Mock Data

The `data.ts` file contains realistic mock data for all entities:

### Documents

- **mockDocument**: A complete document with long-form educational content
- **mockDocumentStatuses**: Processing, ready, and failed states

### Graphs

- **mockGraph**: A knowledge graph with 8 nodes and 9 edges
- Contains realistic Mermaid syntax for visualization
- Includes document references for each node

### Quizzes

- **mockQuiz**: 5 quiz questions with varying difficulty levels
- Each question has 4 options, correct answer, and explanation

### Notes

- **mockNotes**: Sample notes attached to graph nodes

### Jobs

- **mockJobStates**: Queued, processing, completed, and failed states
- Used for simulating async operations (graph generation)

## Simulated Behaviors

### Realistic Network Delays

All handlers include simulated delays (500-2000ms) to mimic real network conditions:

```typescript
// From handlers.ts
const simulateDelay = async (min = 500, max = 2000) => {
  const delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
  await delay(delayMs);
};
```

### Stateful Polling

Document and job status endpoints simulate state transitions over time:

```typescript
// Document status progresses: 0% -> 50% -> 100%
POST /documents        → status: 'processing', progress: 0
GET /documents/:id/status (after 1s) → progress: 50
GET /documents/:id/status (after 2s) → progress: 100, status: 'ready'
```

### Error Scenarios

Special IDs trigger error responses for testing:

| Endpoint | Special ID | Error Type |
|----------|-----------|------------|
| GET /documents/:id | `doc_notfound` | 404 Not Found |
| GET /documents/:id/status | `doc_failed` | Processing Failed |
| GET /graphs/:id | `graph_notfound` | 404 Not Found |
| POST /graphs/generate-ratelimit | (any) | 429 Rate Limit |
| POST /connections/explain-unavailable | (any) | 503 Service Unavailable |

**Example:**

```typescript
// Trigger 404 error
const { data, error } = useDocument('doc_notfound');
// error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found' }

// Trigger rate limit
const { mutate } = useGraphGeneration();
mutate({ documentId: 'doc_123' }); // Normal response
// To test rate limit, call the special endpoint directly in tests
```

## API Coverage

All endpoints from `/META/Server_API_Reference.md` are fully mocked:

### Health Checks
- ✅ GET /health
- ✅ GET /health/ready
- ✅ GET /health/deep

### Documents
- ✅ POST /api/v1/documents (file upload)
- ✅ POST /api/v1/documents/from-url (URL extraction)
- ✅ GET /api/v1/documents/:id
- ✅ GET /api/v1/documents/:id/status

### Graphs
- ✅ POST /api/v1/graphs/generate
- ✅ GET /api/v1/graphs/:id
- ✅ GET /api/v1/jobs/:id (job status)

### Connections
- ✅ POST /api/v1/connections/explain

### Quizzes
- ✅ POST /api/v1/quizzes/generate
- ✅ POST /api/v1/quizzes/:id/submit

### Notes
- ✅ POST /api/v1/notes
- ✅ GET /api/v1/notes?graphId=:graphId
- ✅ PUT /api/v1/notes/:id
- ✅ DELETE /api/v1/notes/:id

## Debugging

### Enable MSW Logging

MSW logs all intercepted requests to the console:

```
[MSW] POST /api/v1/documents
[MSW] GET /api/v1/documents/doc_abc123/status
[MSW] GET /api/v1/graphs/graph_abc123
```

### Unhandled Requests

If you make a request to an endpoint without a handler, MSW will log a warning:

```
[MSW] Unhandled GET request to http://localhost:3000/api/v1/new-endpoint.
Consider adding a handler for this endpoint.
```

### Disable MSW Temporarily

To quickly disable MSW without changing code:

```bash
# In .env.local
NEXT_PUBLIC_MSW_ENABLED=false
```

Then restart the dev server.

## Adding New Handlers

When adding a new API endpoint:

### 1. Add Mock Data

```typescript
// data.ts
export const mockNewFeature = {
  id: 'feature_123',
  name: 'Feature Name',
  // ... other fields
};
```

### 2. Add Handler

```typescript
// handlers.ts
import { mockNewFeature } from './data';

export const handlers = [
  // ... existing handlers

  http.get(`${BASE_URL}/new-endpoint`, async () => {
    await simulateDelay();
    console.log('[MSW] GET /new-endpoint');

    return successResponse(mockNewFeature);
  }),
];
```

### 3. Test the Handler

```typescript
// newFeature.test.tsx
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('should fetch new feature data', async () => {
  // Your test code
});
```

## Best Practices

### DO

- ✅ Use realistic mock data that matches production structure
- ✅ Simulate network delays to catch race conditions
- ✅ Test error scenarios using special IDs or handler overrides
- ✅ Reset handlers after each test with `server.resetHandlers()`
- ✅ Keep mock data in sync with API reference documentation
- ✅ Log all handler calls for debugging

### DON'T

- ❌ Don't commit `public/mockServiceWorker.js` (it's generated)
- ❌ Don't use MSW in production (it's dev/test only)
- ❌ Don't forget to run `pnpm msw init public/` on setup
- ❌ Don't rely on MSW state between tests (always reset)
- ❌ Don't mock internal functions (only network requests)

## Troubleshooting

### MSW Not Starting

**Problem:** No console logs from MSW, requests go to real backend

**Solutions:**
1. Check `NEXT_PUBLIC_MSW_ENABLED=true` in `.env.local`
2. Ensure `pnpm msw init public/` was run
3. Check `public/mockServiceWorker.js` exists
4. Look for errors in browser console
5. Restart dev server

### Service Worker Registration Failed

**Problem:** Error: "Failed to register service worker"

**Solutions:**
1. Check you're on `http://localhost` (not `https://` or file://)
2. Clear browser cache and service workers
3. Run `pnpm msw init public/ --save` again
4. Check browser DevTools > Application > Service Workers

### Tests Failing with Network Errors

**Problem:** Tests make real network requests instead of using MSW

**Solutions:**
1. Ensure `server.listen()` is called in `beforeAll()`
2. Check handlers are imported from `@/mocks/handlers`
3. Verify request URL matches handler pattern exactly
4. Check MSW version compatibility with Node.js

### TypeScript Errors

**Problem:** Import errors for MSW modules

**Solutions:**
1. Ensure MSW is installed: `pnpm add -D msw`
2. Check `tsconfig.json` includes `mocks` directory
3. Restart TypeScript server in editor

## Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW GitHub](https://github.com/mswjs/msw)
- [MSW Examples](https://mswjs.io/docs/getting-started)
- [Graphex API Reference](/META/Server_API_Reference.md)

## Version

**MSW Version:** 2.12.1
**Last Updated:** 2025-11-11
**Maintainer:** Development Team
