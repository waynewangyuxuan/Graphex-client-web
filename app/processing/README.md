# Document Processing Status Page

## Overview

The `/processing` route displays real-time document processing status with automatic polling and redirect functionality.

**Route**: `/processing?docId={documentId}`

## File Structure

```
app/processing/
├── page.tsx         # Main processing status page (Client Component)
├── loading.tsx      # Loading state for page transitions
├── error.tsx        # Error boundary for page-level errors
└── README.md        # This file
```

## Features

### 1. Status Polling
- Automatically polls document status every 2 seconds using `useDocumentStatus` hook
- Polling stops when status becomes 'ready' or 'failed'
- Uses React Query's `refetchInterval` for efficient polling

### 2. Progress Display
- Real-time progress bar (0-100%)
- Stage-based status messages:
  - 0-20%: "Starting document analysis..."
  - 20-40%: "Extracting content..."
  - 40-60%: "Processing document structure..."
  - 60-80%: "Analyzing concepts..."
  - 80-95%: "Generating knowledge graph..."
  - 95-100%: "Finalizing..."

### 3. Automatic Redirect
- When `status === 'ready'`, automatically redirects to `/graph/{docId}`
- Uses `hasRedirected` flag to prevent double-redirects
- Smooth transition with Next.js router

### 4. Error Handling

#### Missing Document ID
- Displayed when no `docId` query parameter is provided
- Shows user-friendly message with "Return to Upload" button

#### Document Not Found
- Catches API errors (especially `DOCUMENT_NOT_FOUND`)
- Provides clear error message and recovery options

#### Processing Failed
- Displayed when `status === 'failed'`
- Shows backend error message if available
- Option to return to upload page

#### Page-Level Errors
- Error boundary (`error.tsx`) catches rendering errors
- Provides "Try Again" and "Go Home" recovery options

## Component Architecture

### Server vs Client Components

**Client Component** (`'use client'`)
- **Why**: Requires browser-only hooks
  - `useSearchParams` (read URL query parameters)
  - `useRouter` (programmatic navigation)
  - `useDocumentStatus` (React Query hook with polling)
  - `useEffect` (side effects for redirect logic)

### State Management

**Local State (useState)**
- `hasRedirected`: Prevents double-redirect bug

**Server State (React Query)**
- `useDocumentStatus`: Polls document processing status
  - Query key: `['documents', docId, 'status']`
  - Refetch interval: 2000ms (2 seconds)
  - Auto-stops when status is 'ready' or 'failed'

### URL Parameters

Query parameter: `docId` (required)
```
/processing?docId=doc_abc123xyz
```

Retrieved via `useSearchParams().get('docId')`

## UI/UX Details

### Design System Compliance

**Colors** (from UIUX.md):
- Background: Light blue (`bg-background`)
- Card: White with shadow (`bg-chrome`)
- Primary accent: Bright blue (`text-primary`, `bg-primary`)
- Success: Vibrant green (`bg-success`)
- Error: Bright red (`bg-error`, `text-error`)

**Typography**:
- Headers: Inter, semibold, 18-24px
- Body: 14-16px, readable secondary text color
- Status messages: Medium weight for emphasis

**Spacing**:
- 8px base unit (consistent with design system)
- Generous padding (24-32px) around cards
- Proper vertical rhythm with space-y utilities

**Interactions**:
- Smooth transitions (200-400ms)
- Loading spinners with accessibility labels
- Clear visual hierarchy

### Accessibility

**ARIA Attributes**:
- Progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Spinner: `role="status"`, `aria-live="polite"`
- Screen reader labels: `<span className="sr-only">`

**Keyboard Navigation**:
- All buttons are keyboard accessible
- Focus visible states on interactive elements

**Visual Indicators**:
- Never rely on color alone
- Icons + text labels for all states
- High contrast ratios (WCAG AA compliant)

## Data Flow

```
User uploads document
      ↓
POST /api/v1/documents
      ↓
Redirect to /processing?docId=xxx
      ↓
Poll GET /api/v1/documents/:id/status every 2s
      ↓
Display progress (0-100%)
      ↓
When status === 'ready'
      ↓
Redirect to /graph/{docId}
```

## API Integration

### Hook: `useDocumentStatus`

**Location**: `/hooks/useDocument.ts`

**Type**: `DocumentStatusResponse`
```typescript
interface DocumentStatusResponse {
  id: string;
  status: 'processing' | 'ready' | 'failed';
  progress: number; // 0-100
  errorMessage: string | null;
}
```

**Polling Logic**:
```typescript
refetchInterval: (data) => {
  if (!data) return 2000;
  if (data.status === 'ready' || data.status === 'failed') {
    return false; // Stop polling
  }
  return 2000; // Continue polling
}
```

## Error States & Recovery

| State | Condition | UI | Actions |
|-------|-----------|-----|---------|
| Missing docId | No query param | Error card with warning icon | "Return to Upload" |
| Document not found | API 404 error | Error card with alert icon | "Return to Upload" |
| Processing failed | status === 'failed' | Error card with failure message | "Upload Another" |
| Page error | Rendering error | Error boundary UI | "Try Again", "Go Home" |
| Initial loading | !status && isLoading | Centered spinner card | None (automatic) |

## Performance Considerations

### Polling Efficiency
- **Interval**: 2 seconds (balance between UX and server load)
- **Auto-stop**: Polling stops when complete (no wasted requests)
- **Background pause**: `refetchIntervalInBackground: false` (saves battery)

### Bundle Size
- Client component only (not in initial page load)
- Code-split via Next.js automatic splitting
- Lightweight dependencies (all UI components are shared)

### Caching
- `staleTime: 0` (always fetch fresh status)
- `cacheTime: 1000ms` (brief cache for rapid re-renders)
- `retry: false` (don't retry status checks)

## Testing Considerations

### Unit Tests (Recommended)
- Test redirect logic when status becomes 'ready'
- Test error handling for missing docId
- Test status message generation based on progress
- Test polling stop conditions

### Integration Tests (Recommended)
- Test full flow with MSW mock server
- Simulate status progression (0% → 100%)
- Test error states (failed status, network errors)
- Test redirect behavior

### E2E Tests (Optional)
- Upload document → Wait on processing page → Auto-redirect to graph

## Common Issues & Solutions

### Issue: Double Redirect
**Symptom**: Redirects to graph page twice
**Solution**: `hasRedirected` flag prevents this

### Issue: Polling Doesn't Stop
**Symptom**: Continues polling after completion
**Solution**: Check `refetchInterval` logic returns `false` correctly

### Issue: Blank Page on Direct Visit
**Symptom**: Visiting `/processing` without docId shows blank
**Solution**: Error state catches this and shows helpful message

### Issue: Slow Redirect After Completion
**Symptom**: Delay between status='ready' and redirect
**Solution**: `useEffect` dependency array includes all required values

## Future Enhancements

- [ ] Add cancel processing button (API support needed)
- [ ] Show estimated time remaining
- [ ] Add websocket support for real-time updates (replace polling)
- [ ] Show detailed processing stages from backend
- [ ] Add animation when progress increases
- [ ] Save processing state to localStorage (resume on refresh)
- [ ] Show document preview thumbnail while processing

## Related Files

- `/hooks/useDocument.ts` - React Query hook for document operations
- `/types/api.types.ts` - TypeScript types for API responses
- `/components/ui/progress.tsx` - Progress bar component
- `/components/ui/card.tsx` - Card container component
- `/components/ui/button.tsx` - Button component
- `/components/ui/spinner.tsx` - Loading spinner component
- `/app/graph/[graphId]/page.tsx` - Destination after processing completes

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Query Polling Guide](https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching)
- [TECHNICAL.md](/META/Core/TECHNICAL.md) - Technical architecture
- [UIUX.md](/META/Core/UIUX.md) - Design system
- [REGULATION.md](/META/Core/REGULATION.md) - Code standards
