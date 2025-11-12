# Mock Service Worker (MSW) Directory

**Purpose**: API mocking infrastructure for frontend development and testing without a running backend.

## Directory Structure

```
mocks/
├── META.md              # This file - directory overview
├── README.md            # Complete MSW documentation
├── QUICKSTART.md        # 3-step setup guide
├── index.ts             # Central exports
├── data.ts              # Mock data definitions
├── handlers.ts          # MSW request handlers (2000+ lines)
├── server.ts            # Node.js server setup (for Jest)
└── browser.ts           # Browser worker setup (for development)
```

## Quick Reference

### Files

| File | Purpose | Used By |
|------|---------|---------|
| `data.ts` | Mock data (documents, graphs, quizzes) | `handlers.ts`, tests |
| `handlers.ts` | Request handlers for all API endpoints | `server.ts`, `browser.ts` |
| `server.ts` | MSW server for Node.js testing | Jest tests |
| `browser.ts` | MSW worker for browser development | `app/providers.tsx` |
| `index.ts` | Central export file | Tests, utilities |

### Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `QUICKSTART.md` | Get started in 3 steps | New developers |
| `README.md` | Complete documentation (600+ lines) | All developers |
| `META.md` | Directory overview (this file) | Project navigation |

## What This Provides

### For Development

- **Full API mocking**: All endpoints from `/META/Server_API_Reference.md`
- **Realistic delays**: 500-2000ms to simulate network conditions
- **Stateful behavior**: Document processing and job status transitions
- **Error scenarios**: 404, 429, 503 responses for testing edge cases
- **Console logging**: All intercepted requests logged for debugging

### For Testing

- **Jest integration**: Pre-configured in `jest.setup.ts`
- **Easy setup**: Just `server.listen()` in tests
- **Handler overrides**: Override responses for specific test cases
- **No network requests**: All tests run offline, fast and reliable
- **Comprehensive coverage**: Tests for all handlers in `__tests__/mocks/`

## Coverage

### API Endpoints (All Mocked)

#### Documents (4 endpoints)
- ✅ POST /api/v1/documents - File upload
- ✅ POST /api/v1/documents/from-url - URL extraction
- ✅ GET /api/v1/documents/:id - Get document
- ✅ GET /api/v1/documents/:id/status - Check processing status

#### Graphs (3 endpoints)
- ✅ POST /api/v1/graphs/generate - Generate graph
- ✅ GET /api/v1/graphs/:id - Get graph data
- ✅ GET /api/v1/jobs/:id - Check job status

#### Connections (1 endpoint)
- ✅ POST /api/v1/connections/explain - Get AI explanation

#### Quizzes (2 endpoints)
- ✅ POST /api/v1/quizzes/generate - Generate quiz
- ✅ POST /api/v1/quizzes/:id/submit - Submit answers

#### Notes (4 endpoints)
- ✅ POST /api/v1/notes - Create note
- ✅ GET /api/v1/notes - Get notes by graph
- ✅ PUT /api/v1/notes/:id - Update note
- ✅ DELETE /api/v1/notes/:id - Delete note

#### Health (3 endpoints)
- ✅ GET /health - Basic health check
- ✅ GET /health/ready - Readiness check
- ✅ GET /health/deep - Deep health check

**Total: 17 endpoints fully mocked**

### Mock Data

| Entity | Count | Details |
|--------|-------|---------|
| Documents | 1 | Long-form educational content (2000+ words) |
| Graphs | 1 | 8 nodes, 9 edges, realistic Mermaid syntax |
| Quiz Questions | 5 | Easy/medium/hard difficulty levels |
| Notes | 2 | Sample notes attached to nodes |
| Job States | 4 | Queued, processing, completed, failed |
| Document Statuses | 3 | Processing, ready, failed |

## Usage Examples

### Development Mode

```typescript
// MSW automatically starts in development
// All API calls are intercepted

import { useDocument } from '@/hooks/useDocument';

function MyComponent() {
  const { data } = useDocument('doc_123');
  // MSW returns mock document data
  return <div>{data?.title}</div>;
}
```

### Testing

```typescript
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('should display document', async () => {
  render(<MyComponent />);
  // MSW intercepts the request
  await screen.findByText('Active Learning Strategies');
});
```

### Override Handler in Test

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

test('should handle error', async () => {
  server.use(
    http.get('http://localhost:3000/api/v1/documents/:id', () => {
      return HttpResponse.json({ success: false }, { status: 404 });
    })
  );

  render(<MyComponent />);
  await screen.findByText('Document not found');
});
```

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_MSW_ENABLED=true  # Enable mocking (default in dev)
```

### Toggle Mocking

```bash
# Enable
NEXT_PUBLIC_MSW_ENABLED=true

# Disable (use real backend)
NEXT_PUBLIC_MSW_ENABLED=false
```

## Setup Instructions

### One-Time Setup (Required)

```bash
# Generate service worker file
pnpm msw init public/ --save
```

This creates `public/mockServiceWorker.js` (already in `.gitignore`).

### Development

```bash
pnpm dev
```

### Testing

```bash
pnpm test
```

## Key Features

### Realistic Behavior

- **Network delays**: Random 500-2000ms delays
- **State transitions**: Document/job statuses change over time
- **Validation**: Proper error responses for invalid requests
- **Type safety**: Full TypeScript support

### Developer Experience

- **Console logging**: See all intercepted requests
- **Unhandled request warnings**: Alerts when handler is missing
- **Easy debugging**: Toggle on/off with env variable
- **No backend required**: Develop completely offline

### Testing Support

- **Fast tests**: No network delays in tests (can be configured)
- **Deterministic**: Same mock data every time
- **Isolated**: No shared state between tests
- **Flexible**: Easy to override handlers for edge cases

## Integration Points

### App Integration

- **Entry point**: `app/providers.tsx`
- **Dynamic import**: MSW only loaded in development
- **Initialization**: Waits for worker before rendering app
- **Conditional**: Only runs if `NEXT_PUBLIC_MSW_ENABLED !== 'false'`

### Test Integration

- **Global setup**: `jest.setup.ts`
- **Server lifecycle**: `beforeAll` / `afterEach` / `afterAll`
- **Coverage**: Tests for all handlers in `__tests__/mocks/`

## Maintenance

### Adding New Endpoints

1. **Add mock data** to `data.ts`
2. **Add handler** to `handlers.ts`
3. **Add test** to `__tests__/mocks/handlers.test.ts`
4. **Update README** with new endpoint

### Updating Mock Data

1. **Edit** `data.ts`
2. **Update tests** if data structure changed
3. **Verify** with `pnpm test`

### Syncing with Backend

When API changes:
1. **Check** `/META/Server_API_Reference.md`
2. **Update** handlers to match new API contract
3. **Update** mock data to match new response format
4. **Update** tests

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MSW not starting | Run `pnpm msw init public/` |
| Service worker error | Check browser DevTools > Application |
| Tests making real requests | Ensure `server.listen()` in `beforeAll` |
| Stale responses | Call `server.resetHandlers()` in `afterEach` |

See [README.md](./README.md) for detailed troubleshooting.

## Resources

- **MSW Docs**: https://mswjs.io/
- **API Reference**: `/META/Server_API_Reference.md`
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Full Docs**: [README.md](./README.md)

## Testing Coverage

- **Unit tests**: All handlers tested (100+ test cases)
- **Integration tests**: Component tests use MSW
- **E2E tests**: Can use MSW or real backend

## Performance

- **Development**: Negligible impact (~50ms startup)
- **Testing**: Much faster than real API calls
- **Production**: Not included in bundle (tree-shaken)

## Related Files

```
/
├── app/providers.tsx         # MSW initialization
├── jest.config.ts            # Jest configuration
├── jest.setup.ts             # MSW server setup for tests
├── __tests__/mocks/          # Handler tests
│   └── handlers.test.ts
├── .env.local                # MSW_ENABLED configuration
└── .gitignore                # Excludes mockServiceWorker.js
```

## Status

- ✅ **Production Ready**: All endpoints mocked
- ✅ **Tested**: Comprehensive test suite
- ✅ **Documented**: Complete README + quick start
- ✅ **Integrated**: Works in dev and test environments

## Next Steps

For developers:
1. Read [QUICKSTART.md](./QUICKSTART.md)
2. Run `pnpm msw init public/`
3. Start developing with `pnpm dev`

For testers:
1. Import `server` from `@/mocks/server`
2. Call `server.listen()` in `beforeAll`
3. Write tests as usual

---

**Version**: 1.0
**Last Updated**: 2025-11-11
**Maintainer**: Development Team
**Status**: Production Ready
