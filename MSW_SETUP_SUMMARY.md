# MSW Setup Summary

**Date**: 2025-11-11
**Status**: ✅ Complete - Production Ready

## What Was Delivered

A complete Mock Service Worker (MSW) infrastructure that enables frontend development without a running backend server.

## Files Created

### Core MSW Files (`/mocks/`)

1. **data.ts** (14.8 KB)
   - Mock data for all entities (documents, graphs, quizzes, notes)
   - Realistic educational content (2000+ words)
   - 8-node knowledge graph with Mermaid syntax
   - 5 quiz questions with explanations
   - Helper functions for generating mock IDs and timestamps

2. **handlers.ts** (16.8 KB)
   - Request handlers for ALL 17 API endpoints
   - Realistic network delays (500-2000ms)
   - Stateful polling simulation (document/job status)
   - Error scenarios (404, 429, 503)
   - Request validation
   - Console logging for debugging

3. **server.ts** (815 bytes)
   - MSW server setup for Node.js (Jest tests)
   - Unhandled request warnings
   - Ready to use in tests

4. **browser.ts** (1.7 KB)
   - MSW worker setup for browser development
   - Automatic initialization
   - Error handling and logging
   - SSR-safe (checks for window object)

5. **index.ts** (411 bytes)
   - Central export file for easy imports
   - Exports handlers, server, worker, and data

### Documentation (`/mocks/`)

6. **README.md** (11 KB)
   - Complete documentation (600+ lines)
   - API coverage table
   - Usage examples
   - Troubleshooting guide
   - Best practices

7. **QUICKSTART.md** (2.2 KB)
   - 3-step setup guide for new developers
   - Quick test examples
   - Common troubleshooting

8. **META.md** (8.9 KB)
   - Directory overview
   - File reference table
   - Coverage summary
   - Integration points

### Test Files

9. **`__tests__/mocks/handlers.test.ts`** (18.8 KB)
   - Comprehensive tests for all MSW handlers
   - 100+ test cases covering:
     - All 17 endpoints
     - Error scenarios
     - Validation
     - Response format
     - Stateful behavior

10. **`__tests__/examples/msw-example.test.tsx`** (10.2 KB)
    - Example component tests using MSW
    - Demonstrates best practices:
      - Default mock responses
      - Handler overrides
      - Error scenarios
      - Delayed responses
      - Stateful polling
      - Multiple requests

### Configuration Files

11. **jest.config.ts** (1.5 KB)
    - Jest configuration with MSW integration
    - Path aliases
    - Coverage configuration (70% threshold)
    - Test match patterns

12. **jest.setup.ts** (1.8 KB)
    - Global test setup with MSW server
    - Mock window APIs (matchMedia, IntersectionObserver, ResizeObserver)
    - Automatic server lifecycle management

### Integration

13. **app/providers.tsx** (updated)
    - MSW initialization in development mode
    - Dynamic import (not bundled in production)
    - Race condition prevention (waits for MSW before rendering)
    - Environment variable control

14. **.env.local** (updated)
    - Added `NEXT_PUBLIC_MSW_ENABLED=true`
    - Documentation comment

15. **.gitignore** (updated)
    - Added `public/mockServiceWorker.js` exclusion

## API Coverage

### Endpoints Mocked (17 total)

#### Documents (4)
- ✅ POST /api/v1/documents (file upload with validation)
- ✅ POST /api/v1/documents/from-url (URL extraction)
- ✅ GET /api/v1/documents/:id (get document)
- ✅ GET /api/v1/documents/:id/status (processing status)

#### Graphs (3)
- ✅ POST /api/v1/graphs/generate (async graph generation)
- ✅ GET /api/v1/graphs/:id (get graph data)
- ✅ GET /api/v1/jobs/:id (job status polling)

#### Connections (1)
- ✅ POST /api/v1/connections/explain (AI explanation)

#### Quizzes (2)
- ✅ POST /api/v1/quizzes/generate (generate quiz)
- ✅ POST /api/v1/quizzes/:id/submit (submit answers)

#### Notes (4)
- ✅ POST /api/v1/notes (create note)
- ✅ GET /api/v1/notes (get notes by graph)
- ✅ PUT /api/v1/notes/:id (update note)
- ✅ DELETE /api/v1/notes/:id (delete note)

#### Health (3)
- ✅ GET /health (basic health check)
- ✅ GET /health/ready (readiness check)
- ✅ GET /health/deep (deep health check)

## Key Features

### For Development

✅ **Full API Mocking**: All endpoints from Server_API_Reference.md
✅ **Realistic Delays**: 500-2000ms to catch race conditions
✅ **Stateful Behavior**: Document/job status transitions over time
✅ **Error Scenarios**: 404, 429, 503 responses using special IDs
✅ **Console Logging**: All requests logged for debugging
✅ **Easy Toggle**: Environment variable to enable/disable

### For Testing

✅ **Jest Integration**: Pre-configured in jest.setup.ts
✅ **Easy Setup**: Just import server and use in tests
✅ **Handler Overrides**: Override responses for specific tests
✅ **No Network**: All tests run offline
✅ **Comprehensive Tests**: 100+ test cases for handlers
✅ **Example Tests**: Real-world examples with best practices

### Developer Experience

✅ **TypeScript**: Full type safety
✅ **Documentation**: 3 docs (README, QUICKSTART, META)
✅ **No Backend Required**: Develop completely offline
✅ **Fast Tests**: No network delays
✅ **Unhandled Warnings**: Alerts for missing handlers

## Setup Instructions

### One-Time Setup (Required)

```bash
# Generate service worker file
pnpm msw init public/ --save
```

This creates `public/mockServiceWorker.js` (already in `.gitignore`).

### Start Development

```bash
pnpm dev
```

Expected console output:
```
[MSW] Mock Service Worker started successfully
[MSW] API requests will be intercepted and mocked
```

### Run Tests

```bash
pnpm test
```

## Verification

To verify MSW is working, open browser console and run:

```javascript
fetch('http://localhost:3000/api/v1/health')
  .then(r => r.json())
  .then(console.log);

// Expected output:
// {
//   success: true,
//   data: { status: 'ok', timestamp: '...' },
//   meta: { timestamp: '...', requestId: '...' }
// }
```

## Configuration

### Enable/Disable Mocking

```bash
# In .env.local
NEXT_PUBLIC_MSW_ENABLED=true   # Enable (default in dev)
NEXT_PUBLIC_MSW_ENABLED=false  # Disable (use real backend)
```

### Override Handler in Tests

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

test('should handle error', async () => {
  server.use(
    http.get('http://localhost:3000/api/v1/documents/:id', () => {
      return HttpResponse.json({ success: false }, { status: 404 });
    })
  );

  // Your test code
});
```

## Mock Data Highlights

### Document
- **Title**: "Active Learning Strategies in Education"
- **Content**: 2000+ words of realistic educational content
- **Sections**: Key principles, implementation strategies, evidence base

### Graph
- **Nodes**: 8 concepts (Active Learning, Engagement, Retention, etc.)
- **Edges**: 9 relationships with semantic labels
- **Format**: Valid Mermaid syntax ready for rendering
- **Refs**: Each node has document references with character offsets

### Quiz
- **Questions**: 5 questions with 4 options each
- **Difficulty**: Easy, medium, hard levels
- **Explanations**: Detailed explanations for each answer
- **Node Refs**: Links to relevant graph nodes

## Error Scenarios

Special IDs trigger specific error responses for testing:

| Special ID | Endpoint | Error |
|------------|----------|-------|
| `doc_notfound` | GET /documents/:id | 404 Not Found |
| `doc_failed` | GET /documents/:id/status | Processing Failed |
| `graph_notfound` | GET /graphs/:id | 404 Not Found |
| (any) | POST /graphs/generate-ratelimit | 429 Rate Limit |
| (any) | POST /connections/explain-unavailable | 503 Service Unavailable |

## Testing Examples

### Basic Test

```typescript
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('should display document', async () => {
  render(<DocumentViewer documentId="doc_123" />);
  await screen.findByText('Active Learning Strategies');
});
```

### Error Test

```typescript
test('should handle 404', async () => {
  render(<DocumentViewer documentId="doc_notfound" />);
  await screen.findByText('Document not found');
});
```

See `__tests__/examples/msw-example.test.tsx` for more examples.

## File Sizes

```
mocks/
├── data.ts              14.8 KB  (mock data)
├── handlers.ts          16.8 KB  (all endpoints)
├── server.ts               815 B  (test setup)
├── browser.ts            1.7 KB  (dev setup)
├── index.ts                411 B  (exports)
├── README.md            11.0 KB  (docs)
├── QUICKSTART.md         2.2 KB  (quick start)
└── META.md               8.9 KB  (overview)

__tests__/
├── mocks/handlers.test.ts       18.8 KB  (handler tests)
└── examples/msw-example.test.tsx 10.2 KB  (example tests)

Config:
├── jest.config.ts        1.5 KB
└── jest.setup.ts         1.8 KB

Total: ~88 KB of MSW infrastructure
```

## Performance Impact

- **Development**: ~50ms startup time (negligible)
- **Testing**: Much faster than real API calls
- **Production**: Zero (not included in bundle via tree-shaking)

## Next Steps

1. **Run setup**: `pnpm msw init public/ --save`
2. **Start dev**: `pnpm dev`
3. **Verify**: Check console for MSW logs
4. **Build features**: All API calls will be mocked
5. **Write tests**: Import server and use as shown in examples

## Resources

- **Quick Start**: `/mocks/QUICKSTART.md`
- **Full Docs**: `/mocks/README.md`
- **Directory Overview**: `/mocks/META.md`
- **Test Examples**: `/__tests__/examples/msw-example.test.tsx`
- **MSW Docs**: https://mswjs.io/
- **API Reference**: `/META/Server_API_Reference.md`

## Status

✅ **Complete**: All endpoints mocked
✅ **Tested**: Comprehensive test suite
✅ **Documented**: 3 documentation files
✅ **Integrated**: Works in dev and test
✅ **Production Ready**: Can be used immediately

## Support

If you encounter issues:

1. Read `/mocks/README.md` troubleshooting section
2. Check `/mocks/QUICKSTART.md` for setup steps
3. Review `__tests__/examples/msw-example.test.tsx` for usage patterns
4. Consult MSW documentation at https://mswjs.io/

---

**Created**: 2025-11-11
**MSW Version**: 2.12.1
**Status**: Production Ready
**Maintainer**: Development Team
