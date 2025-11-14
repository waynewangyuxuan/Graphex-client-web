# Backend Integration Guide

**Status**: Ready for Integration
**Backend URL**: http://localhost:4000
**Frontend Port**: http://localhost:3000

---

## Quick Start

### 1. Start Backend Server

```bash
# In your backend directory
npm run dev
```

Backend should be running on `http://localhost:4000`

### 2. Configure Frontend

Update `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Disable MSW to use real backend
NEXT_PUBLIC_MSW_ENABLED=false
```

### 3. Start Frontend

```bash
# In this directory
pnpm dev
```

Frontend runs on `http://localhost:3000`

---

## API Integration

### Document Upload Flow

```typescript
// 1. Upload PDF/Text File
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('title', 'My Research Paper');

const response = await fetch('http://localhost:4000/api/v1/documents', {
  method: 'POST',
  body: formData,
});

const { data: document } = await response.json();
// document.id - Use this for graph generation
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "id": "clxy123abc",
    "title": "My Paper",
    "sourceType": "pdf",
    "status": "ready",
    "fileSize": 524288,
    "createdAt": "2025-11-14T...",
    "updatedAt": "2025-11-14T..."
  }
}
```

### Graph Generation Flow

```typescript
// 2. Generate Graph from Document
const graphResponse = await fetch('http://localhost:4000/api/v1/graphs/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ documentId: document.id }),
});

const { data: graph } = await graphResponse.json();
// graph.graphId - Use this to fetch full graph data
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "graphId": "clxy456def",
    "status": "completed",
    "nodeCount": 12,
    "edgeCount": 18,
    "qualityScore": 85,
    "cost": 0.12,
    "processingTimeMs": 15432
  }
}
```

### Graph Data Retrieval

```typescript
// 3. Fetch Complete Graph Data
const graphDataResponse = await fetch(
  `http://localhost:4000/api/v1/graphs/${graph.graphId}`
);
const { data: graphData } = await graphDataResponse.json();

// graphData.nodes - Array of nodes with sourceReferences
// graphData.edges - Array of edges
// graphData.mermaidCode - Mermaid diagram syntax
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "id": "clxy456def",
    "documentId": "clxy123abc",
    "nodes": [
      {
        "id": "node-1",
        "title": "Machine Learning",
        "nodeType": "concept",
        "summary": "A 2-sentence summary...",
        "sourceReferences": [
          {
            "start": 1234,
            "end": 1567,
            "text": "Machine learning is..."
          }
        ]
      }
    ],
    "edges": [...],
    "mermaidCode": "flowchart TD...",
    "status": "ready"
  }
}
```

### Document Content Retrieval (For Paragraph Jumping)

```typescript
// 4. Get Document Content for Highlighting
const documentResponse = await fetch(
  `http://localhost:4000/api/v1/documents/${graphData.documentId}`
);
const { data: document } = await documentResponse.json();

// document.content - Full extracted text from PDF
// Use this for highlighting and paragraph jumping
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "id": "clxy123abc",
    "title": "My Paper",
    "content": "Full extracted text from PDF...",
    "sourceType": "pdf",
    "status": "ready",
    "metadata": {
      "fileSize": 524288,
      "quality": { "score": 85 },
      "images": [...]
    }
  }
}
```

---

## Frontend Implementation

### Using React Query Hooks

Our frontend uses React Query hooks that automatically handle the API calls:

```typescript
import { useUploadDocument } from '@/hooks/useDocument';
import { useGenerateGraph, useGraph } from '@/hooks/useGraph';

// Upload document
const uploadMutation = useUploadDocument();
uploadMutation.mutate(formData, {
  onSuccess: (document) => {
    console.log('Document uploaded:', document.id);
    // Generate graph next
  },
});

// Generate graph
const generateMutation = useGenerateGraph();
generateMutation.mutate({ documentId }, {
  onSuccess: (result) => {
    console.log('Graph generated:', result.graphId);
    // Navigate to graph view
  },
});

// Fetch graph data
const { data: graph, isLoading } = useGraph(graphId);
```

### Node Click → Paragraph Jump Implementation

```typescript
// In app/graph/[graphId]/page.tsx

function handleNodeClick(nodeId: string) {
  const node = graph?.nodes.find(n => n.id === nodeId);

  if (node?.sourceReferences?.[0]) {
    const ref = node.sourceReferences[0];

    // Update reading panel highlight
    setHighlightRange({
      startOffset: ref.start,
      endOffset: ref.end,
    });

    // Reading panel will:
    // 1. Fetch document.content
    // 2. Extract text from ref.start to ref.end
    // 3. Scroll to that position
    // 4. Highlight the text
  }
}
```

---

## Schema Mapping

### Document Object

| Backend Field | Frontend Type Field | Description |
|---------------|---------------------|-------------|
| `id` | `id: string` | Document ID |
| `title` | `title: string` | Document title |
| `content` | `content: string` | Full extracted text |
| `sourceType` | `sourceType: 'pdf' \| 'text' \| 'markdown'` | File type |
| `status` | `status: 'ready' \| 'processing' \| 'failed'` | Processing status |
| `metadata.fileSize` | `metadata.fileSize: number` | File size in bytes |
| `metadata.quality.score` | `metadata.quality.score: number` | Quality score (0-100) |

### Graph Node Object

| Backend Field | Frontend Type Field | Description |
|---------------|---------------------|-------------|
| `id` | `id: string` | Node ID |
| `title` | `title: string` | Node title |
| `nodeType` | `nodeType: string` | Type (e.g., "concept") |
| `summary` | `summary: string` | 2-sentence summary |
| `sourceReferences` | `sourceReferences: DocumentReference[]` | Links to document content |
| `sourceReferences[].start` | `start: number` | Character position in content |
| `sourceReferences[].end` | `end: number` | Character position in content |
| `sourceReferences[].text` | `text: string` | Actual text snippet |

### Graph Object

| Backend Field | Frontend Type Field | Description |
|---------------|---------------------|-------------|
| `id` | `id: string` | Graph ID |
| `documentId` | `documentId: string` | Source document ID |
| `nodes` | `nodes: GraphNode[]` | Array of nodes |
| `edges` | `edges: GraphEdge[]` | Array of edges |
| `mermaidCode` | `mermaidCode: string` | Mermaid diagram syntax |
| `status` | `status: 'ready' \| 'processing' \| 'failed'` | Generation status |

---

## Environment Configuration

### Development (with real backend)

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_MSW_ENABLED=false
NODE_ENV=development
```

### Development (with MSW mocks)

`.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_MSW_ENABLED=true
NODE_ENV=development
```

### Production

`.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.graphex.com/api/v1
NEXT_PUBLIC_MSW_ENABLED=false
NODE_ENV=production
```

---

## Testing Integration

### Manual Testing Steps

1. **Start Both Servers**:
   ```bash
   # Terminal 1 - Backend
   cd ../backend
   npm run dev

   # Terminal 2 - Frontend
   cd ../frontend
   pnpm dev
   ```

2. **Test Document Upload**:
   - Navigate to http://localhost:3000
   - Upload a PDF file
   - Check browser network tab for POST to `/api/v1/documents`
   - Verify response contains `documentId`

3. **Test Graph Generation**:
   - After upload, graph generation should start automatically
   - Check network tab for POST to `/api/v1/graphs/generate`
   - Verify response contains `graphId`

4. **Test Graph View**:
   - Should redirect to `/graph/[graphId]`
   - Check network tab for GET `/api/v1/graphs/[graphId]`
   - Verify graph renders with nodes and edges

5. **Test Node Click**:
   - Click any node in the graph
   - Reading panel should scroll to corresponding paragraph
   - Text should be highlighted
   - Note modal should open

### cURL Testing

```bash
# 1. Upload document
curl -X POST http://localhost:4000/api/v1/documents \
  -F "file=@/path/to/paper.pdf" \
  -F "title=My Paper"

# Response: { "data": { "id": "doc-123", ... } }

# 2. Generate graph
curl -X POST http://localhost:4000/api/v1/graphs/generate \
  -H "Content-Type: application/json" \
  -d '{"documentId": "doc-123"}'

# Response: { "data": { "graphId": "graph-456", ... } }

# 3. Get graph data
curl http://localhost:4000/api/v1/graphs/graph-456

# 4. Get document content
curl http://localhost:4000/api/v1/documents/doc-123
```

---

## Troubleshooting

### Issue: "Network Error" or "Unable to connect"

**Cause**: Backend not running or wrong URL

**Fix**:
1. Ensure backend is running: `npm run dev` (in backend directory)
2. Check backend URL in `.env.local`: `http://localhost:4000/api/v1`
3. Test backend directly: `curl http://localhost:4000/health`

### Issue: CORS errors

**Cause**: Backend not configured to accept requests from frontend

**Fix**: Ensure backend has CORS middleware configured for `http://localhost:3000`

### Issue: API returns 404

**Cause**: API endpoint doesn't exist or wrong URL

**Fix**:
1. Verify backend API routes match frontend expectations
2. Check API base URL in `.env.local`
3. Look at backend console for route registration logs

### Issue: MSW still intercepting requests

**Cause**: MSW not disabled

**Fix**:
1. Set `NEXT_PUBLIC_MSW_ENABLED=false` in `.env.local`
2. Restart frontend dev server: `pnpm dev`
3. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Issue: Graph not rendering

**Cause**: Mismatch in schema or missing data

**Fix**:
1. Check browser console for errors
2. Verify API response matches expected schema
3. Check that `mermaidCode` is valid Mermaid syntax

### Issue: Paragraph jump not working

**Cause**: Source references missing or incorrect

**Fix**:
1. Verify `node.sourceReferences` exists and has correct structure
2. Check that `document.content` is the full text (not truncated)
3. Verify `start` and `end` character positions are within `content` length

---

## API Client Configuration

The frontend API client (`lib/api-client.ts`) is pre-configured with:

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/api/v1`)
- **Timeout**: 30 seconds (5 minutes for uploads)
- **Retry Logic**: Automatic retry with exponential backoff for 5xx errors
- **Rate Limiting**: Handles 429 responses with retry-after header
- **Request ID**: Unique ID for request tracing
- **Error Normalization**: Consistent error format across all requests

No additional configuration needed!

---

## Next Steps

1. Start backend server on port 4000
2. Update `.env.local` to disable MSW
3. Test complete flow: Upload → Generate → View → Interact
4. Report any schema mismatches or integration issues

---

**Version**: 1.0
**Updated**: 2025-11-14
**Maintainer**: Frontend Team
