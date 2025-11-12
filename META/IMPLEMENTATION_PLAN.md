# Graphex Web Client Implementation Plan

**Purpose**: Step-by-step roadmap for building the MVP web client in 2 weeks.

**References**:
- [MVP.md](/META/Core/MVP.md) - Feature priorities
- [TECHNICAL.md](/META/Core/TECHNICAL.md) - Architecture
- [Server_API_Reference.md](/META/Server_API_Reference.md) - Backend API
- [CLAUDE.md](/CLAUDE.md) - Workflow guide

---

## Overview

**Timeline**: 2 weeks (10 working days)
**Approach**: Foundation first → API layer → Features (Week 1) → Features (Week 2) → Testing

**Key Principle**: Build API integration layer first to enable parallel feature development with backend mocks.

---

## Phase 0: Project Foundation (Day 1, ~4 hours)

### Goals
- Initialize Next.js 14 project with all dependencies
- Configure TypeScript, Tailwind, ESLint
- Set up project structure
- Configure environment variables

### Tasks

**0.1 Initialize Project**
```bash
npx create-next-app@latest graphex-web --typescript --tailwind --app --use-pnpm
cd graphex-web
```

**0.2 Install Core Dependencies**
```bash
# State management
pnpm add zustand @tanstack/react-query axios

# UI components
pnpm add @radix-ui/react-dialog @radix-ui/react-popover
pnpm add lucide-react framer-motion clsx

# Forms & validation
pnpm add react-hook-form zod @hookform/resolvers react-dropzone

# Utilities
pnpm add date-fns

# Graph visualization
pnpm add mermaid

# Dev dependencies
pnpm add -D @tanstack/react-query-devtools
```

**0.3 Install Testing Dependencies**
```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom
pnpm add -D @testing-library/user-event @testing-library/hooks
pnpm add -D msw
```

**0.4 Create Project Structure**
```
app/
├── page.tsx                    # Upload page
├── layout.tsx                  # Root layout
├── globals.css                 # Tailwind + custom
├── providers.tsx               # React Query provider
├── graph/[graphId]/page.tsx    # Graph viewer
├── processing/page.tsx         # Status polling
└── quiz/[quizId]/page.tsx      # Quiz interface

components/
├── graph/                      # Graph components
├── reading/                    # Reading panel
├── notes/                      # Note modals
├── connection/                 # Connection modals
├── quiz/                       # Quiz components
├── upload/                     # Upload components
└── ui/                         # Reusable UI (Button, Modal, etc.)

hooks/
├── useGraph.ts
├── useDocument.ts
├── useNotes.ts
├── useQuiz.ts
├── useUpload.ts
└── useConnection.ts

lib/
├── api-client.ts               # Axios setup
├── api/                        # API functions
│   ├── documents.ts
│   ├── graphs.ts
│   ├── connections.ts
│   └── quizzes.ts
├── local-storage.ts            # localStorage helpers
└── utils.ts

stores/
└── app-store.ts                # Zustand store

types/
├── graph.types.ts
├── document.types.ts
├── note.types.ts
└── api.types.ts
```

**0.5 Configure Environment**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

**0.6 Configure Tailwind (colors from UIUX.md)**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#F8F7F4',
        canvas: '#EEECE8',
        teal: {
          DEFAULT: '#2C5F6F',
          light: '#3A7585',
          dark: '#1E4650',
        },
        amber: '#D4A574',
        sage: '#8FA387',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Charter', 'Georgia', 'serif'],
      },
    },
  },
};
```

**Sub-agents to use**: None (manual setup)

---

## Phase 1: API Integration Layer (Day 1-2, ~8 hours)

### Goals
- Set up Axios client with interceptors
- Create React Query hooks for all endpoints
- Implement MSW handlers for testing
- Enable parallel development with mocked backend

### Tasks

**1.1 API Client Setup**

**Agent**: `api-integration-specialist`
**Prompt**:
```
Create the API integration layer for Graphex following TECHNICAL.md Section 6.

Requirements:
1. Axios client in lib/api-client.ts with:
   - Base URL from env
   - Request ID generation
   - Global error handling
   - Request/response logging
   - Rate limit handling (429 responses)

2. API functions in lib/api/:
   - documents.ts: uploadDocument, getDocument, getDocumentStatus
   - graphs.ts: generateGraph, getGraph, getJobStatus
   - connections.ts: explainConnection
   - quizzes.ts: generateQuiz, submitQuiz

3. Type definitions in types/api.types.ts based on Server_API_Reference.md

Reference: /META/Server_API_Reference.md for exact request/response formats
```

**1.2 React Query Hooks**

**Agent**: `api-integration-specialist`
**Prompt**:
```
Create React Query hooks for all API operations following TECHNICAL.md Section 6.2.

Requirements:
1. hooks/useDocument.ts:
   - useDocument(id) - fetch document
   - useDocumentStatus(id) - poll status every 2s while processing
   - useUploadDocument() - mutation with progress tracking

2. hooks/useGraph.ts:
   - useGraph(id) - fetch graph
   - useGenerateGraph() - mutation
   - useJobStatus(jobId) - poll job status every 2s

3. hooks/useConnection.ts:
   - useExplainConnection() - mutation with userHypothesis

4. hooks/useQuiz.ts:
   - useGenerateQuiz() - mutation
   - useSubmitQuiz() - mutation

5. Configure proper cache invalidation, staleTime, and refetchInterval
6. Handle loading/error states consistently

Reference: TECHNICAL.md Section 6 for patterns
```

**1.3 MSW Mock Handlers**

**Agent**: `frontend-test-engineer`
**Prompt**:
```
Set up MSW (Mock Service Worker) handlers for all API endpoints to enable frontend development without backend.

Requirements:
1. Create mocks/handlers.ts with handlers for:
   - POST /documents (return mock document + jobId)
   - GET /documents/:id/status (cycle through processing → ready)
   - GET /documents/:id (return mock document)
   - POST /graphs/generate (return mock jobId)
   - GET /jobs/:id (cycle through queued → processing → completed)
   - GET /graphs/:id (return mock graph with mermaid code, nodes, edges)
   - POST /connections/explain (return mock explanation)
   - POST /quizzes/generate (return mock quiz)
   - POST /quizzes/:id/submit (return mock results)

2. Create mocks/server.ts for test setup
3. Create mocks/browser.ts for development mode
4. Add realistic delays (500-2000ms) to simulate network

Reference: Server_API_Reference.md for response formats
```

**Deliverables**:
- ✅ Axios client with error handling
- ✅ All API functions typed and tested
- ✅ React Query hooks with proper caching
- ✅ MSW handlers for all endpoints
- ✅ Can develop frontend without backend running

---

## Phase 2: State Management (Day 2, ~3 hours)

### Goals
- Set up Zustand store for UI state
- Configure React Query provider
- Implement localStorage helpers for notes (MVP)

### Tasks

**2.1 Zustand Store**

**Agent**: `state-management-architect`
**Prompt**:
```
Create the Zustand store for Graphex UI state following TECHNICAL.md Section 5.1.

Requirements:
1. stores/app-store.ts with:
   - selectedNodeId: string | null
   - hoveredNodeId: string | null
   - interactedNodeIds: Set<string>  // for quiz trigger
   - noteModalOpen: boolean
   - connectionModalOpen: boolean
   - activeConnectionId: string | null
   - readingPanelWidth: number

2. Actions:
   - selectNode(id)
   - hoverNode(id)
   - addInteractedNode(id)
   - openNoteModal()
   - closeNoteModal()
   - openConnectionModal(edgeId)
   - closeConnectionModal()
   - setReadingPanelWidth(width)

3. Use Zustand DevTools for debugging

Reference: TECHNICAL.md Section 5.1 for state structure
```

**2.2 React Query Provider**

**Agent**: `api-integration-specialist`
**Prompt**:
```
Set up React Query provider in app/providers.tsx.

Requirements:
1. QueryClientProvider with config:
   - staleTime: 5 minutes
   - cacheTime: 10 minutes
   - refetchOnWindowFocus: false
   - retry: 2

2. Add ReactQueryDevtools for development
3. Wrap in layout.tsx

Reference: TECHNICAL.md Section 5.2 for cache config
```

**2.3 LocalStorage Helpers (Notes for MVP)**

**Agent**: Manual or simple function
**File**: `lib/local-storage.ts`
```typescript
// MVP: Notes stored in localStorage, migrated to server post-MVP
interface NoteData {
  content: string;
  createdAt: string;
  updatedAt: string;
}

type NotesStore = Record<string, Record<string, NoteData>>; // graphId -> nodeId -> note

export const getNotes = (graphId: string): Record<string, NoteData> => { ... }
export const getNote = (graphId: string, nodeId: string): NoteData | null => { ... }
export const saveNote = (graphId: string, nodeId: string, content: string): void => { ... }
export const deleteNote = (graphId: string, nodeId: string): void => { ... }
```

**Deliverables**:
- ✅ Zustand store with all UI state
- ✅ React Query provider configured
- ✅ LocalStorage helpers for notes

---

## Phase 3: Core UI Components (Day 3, ~6 hours)

### Goals
- Build reusable UI components (Button, Modal, Input, Spinner)
- Establish design system consistency
- Ensure accessibility

### Tasks

**3.1 Base UI Components**

**Agent**: `ui-component-builder`
**Prompt**:
```
Create reusable UI components following UIUX.md design system.

Requirements:
1. components/ui/Button.tsx:
   - Variants: primary (teal bg), secondary (teal outline), ghost (text only)
   - Sizes: sm, md, lg
   - Disabled state, loading state
   - Full TypeScript types

2. components/ui/Modal.tsx:
   - Wrapper around Radix Dialog
   - Consistent styling (max-w-2xl, rounded-lg, p-8)
   - Backdrop blur, ESC to close
   - Focus trap, return focus on close

3. components/ui/Input.tsx:
   - Text input with focus ring (teal)
   - Error state styling
   - Label integration

4. components/ui/Textarea.tsx:
   - Similar to Input but multiline
   - Character counter prop

5. components/ui/Spinner.tsx:
   - Teal spinning loader
   - Sizes: sm, md, lg

6. Ensure WCAG AA compliance (contrast, focus indicators)

Reference: UIUX.md Section 8 for colors and styling
```

**Deliverables**:
- ✅ Button, Modal, Input, Textarea, Spinner components
- ✅ Consistent design system
- ✅ Accessibility compliant

---

## Phase 4: Week 1 Features (Day 3-7)

### Feature 1: Document Upload & Processing (Day 3-4, ~10 hours)

**4.1 Upload Page**

**Agent**: `nextjs-app-router-architect`
**Prompt**:
```
Create the document upload page at app/page.tsx following TECHNICAL.md Section 7.1.

Requirements:
1. Server component that renders FileUploader
2. Simple layout with centered upload area
3. Sample document link (placeholder for now)
4. Redirect to /processing after upload

Reference: TECHNICAL.md Section 7.1 for flow
```

**4.2 File Uploader Component**

**Agent**: `form-architect`
**Prompt**:
```
Build the FileUploader component with react-dropzone following UIUX.md.

Requirements:
1. components/upload/FileUploader.tsx:
   - Drag-and-drop zone
   - Click to select file
   - File validation: PDF, TXT, MD only, max 10MB
   - Show file name and size after selection
   - Clear/remove file button
   - Accepts title input (optional)

2. Use useUploadDocument() mutation hook
3. Show UploadProgress component while uploading
4. Handle errors (file too large, unsupported format)

Reference: UIUX.md for dropzone styling, MVP.md Feature 1
```

**4.3 Upload Progress Component**

**Agent**: `ui-component-builder`
**Prompt**:
```
Build the UploadProgress component showing upload progress.

Requirements:
1. components/upload/UploadProgress.tsx:
   - File name display
   - Progress bar (0-100%)
   - Cancel button (if supported by mutation)
   - Success/error states

Reference: UIUX.md for styling
```

**4.4 Processing Status Page**

**Agent**: `nextjs-app-router-architect`
**Prompt**:
```
Create the processing status page at app/processing/page.tsx.

Requirements:
1. Read docId from query params
2. Use useDocumentStatus(docId) to poll status every 2s
3. Show progress bar and status message
4. When status = "ready", redirect to /graph/[graphId]
5. Handle failure state with retry button

Reference: TECHNICAL.md Section 7.1 for polling
```

**4.5 Tests**

**Agent**: `frontend-test-engineer`
**Prompt**:
```
Write comprehensive tests for document upload feature.

Requirements:
1. FileUploader.test.tsx:
   - File selection works
   - Validation rejects invalid files (wrong type, too large)
   - Upload mutation triggered on submit
   - Progress shown during upload

2. ProcessingPage.test.tsx:
   - Polling starts on mount
   - Redirects when status = "ready"
   - Shows error on failure

3. Use MSW to mock API responses

Target: 80% coverage for upload feature
```

---

### Feature 2: Graph Visualization & Reading Interface (Day 4-6, ~12 hours)

**4.6 Graph Viewer Page**

**Agent**: `nextjs-app-router-architect`
**Prompt**:
```
Create the main graph viewer page at app/graph/[graphId]/page.tsx.

Requirements:
1. Fetch graph data using useGraph(graphId)
2. 60/40 split layout: GraphCanvas (left) + ReadingPanel (right)
3. Loading skeleton while fetching
4. Error boundary for failures
5. Render NoteModal and ConnectionModal (conditionally)

Reference: TECHNICAL.md Section 7.2, UIUX.md for layout
```

**4.7 Mermaid Graph Renderer**

**Agent**: `mermaid-graph-controller`
**Prompt**:
```
Build the Mermaid graph renderer with interactive nodes.

Requirements:
1. components/graph/MermaidRenderer.tsx:
   - Client component (use 'use client')
   - Initialize Mermaid with custom theme (teal colors from UIUX.md)
   - Render mermaidCode to SVG
   - Attach click handlers to nodes
   - Attach click handlers to edges
   - Visual feedback on hover (subtle highlight)
   - Visual feedback on selection (teal border)

2. On node click:
   - Update Zustand: selectNode(nodeId), addInteractedNode(nodeId)
   - Emit event for ReadingPanel to scroll

3. On edge click:
   - Update Zustand: openConnectionModal(edgeId)

4. Track interacted nodes for quiz trigger (after 5 nodes)

Reference: TECHNICAL.md Section 9, UIUX.md Section 10
```

**4.8 Reading Panel**

**Agent**: `ui-component-builder`
**Prompt**:
```
Build the ReadingPanel component that displays document text.

Requirements:
1. components/reading/ReadingPanel.tsx:
   - Fetch document using useDocument(documentId)
   - Display full document text with proper typography (serif font)
   - Listen for node selection events
   - Scroll to relevant section when node clicked
   - Highlight text range based on node.documentRefs
   - Show breadcrumb: Document > Section
   - Smooth scroll behavior (800ms)

Reference: TECHNICAL.md Section 10, UIUX.md typography
```

**4.9 Tests**

**Agent**: `frontend-test-engineer`
**Prompt**:
```
Write tests for graph visualization and reading interface.

Requirements:
1. MermaidRenderer.test.tsx:
   - Renders graph from mermaidCode
   - Node click updates state
   - Edge click opens modal
   - Tracks interacted nodes

2. ReadingPanel.test.tsx:
   - Displays document text
   - Scrolls to section on node selection
   - Highlights correct text range

Target: 80% coverage
```

---

### Feature 3: Note-Taking (Day 6-7, ~6 hours)

**4.10 Note Modal**

**Agent**: `form-architect`
**Prompt**:
```
Build the note-taking modal using Radix Dialog.

Requirements:
1. components/notes/NoteModal.tsx:
   - Opens when noteModalOpen = true (Zustand)
   - Displays selected node title
   - Textarea for note content
   - Load existing note from localStorage (if exists)
   - Auto-save every 2 seconds (debounced)
   - Save to localStorage using lib/local-storage.ts
   - Show save status indicator ("Saving..." / "Saved ✓")
   - Close on ESC or click outside
   - Character counter (optional max length)

2. After saving, show amber indicator on node in graph

Reference: UIUX.md Section 10 for interaction design, TECHNICAL.md Section 7.4
```

**4.11 Note Indicators on Graph**

**Agent**: `mermaid-graph-controller`
**Prompt**:
```
Add visual indicators to graph nodes that have notes.

Requirements:
1. Check localStorage for notes when rendering graph
2. Add amber dot or border to nodes with notes
3. Update indicator when note saved/deleted

Reference: UIUX.md for amber accent color
```

**4.12 Tests**

**Agent**: `frontend-test-engineer`
**Prompt**:
```
Write tests for note-taking feature.

Requirements:
1. NoteModal.test.tsx:
   - Opens/closes correctly
   - Loads existing note from localStorage
   - Saves note to localStorage
   - Auto-save debouncing works
   - Character counter updates

Target: 80% coverage
```

**Week 1 Checkpoint**:
- ✅ Users can upload documents
- ✅ View generated graphs
- ✅ Click nodes to read content
- ✅ Add notes to nodes

---

## Phase 5: Week 2 Features (Day 8-10)

### Feature 4: Pre-Explanation Retrieval (Day 8, ~6 hours)

**4.13 Connection Modal**

**Agent**: `form-architect`
**Prompt**:
```
Build the connection explanation modal with pre-retrieval flow.

Requirements:
1. components/connection/ConnectionModal.tsx:
   - Opens when connectionModalOpen = true
   - Display: "From [Node A] to [Node B]"
   - Step 1: Prompt user for hypothesis
     - "What do you think this relationship is?"
     - Textarea with character counter (min 50 chars)
     - Submit button (disabled until >= 50 chars)

   - Step 2: After submission
     - Lock hypothesis (read-only, grayed out)
     - Show loading spinner
     - Call useExplainConnection mutation

   - Step 3: Show AI explanation
     - Display AI's explanation
     - Show source text excerpts
     - Show evaluation of user's hypothesis (if backend provides)
     - Prompt: "Now explain in your own words"
     - Optional: Save as note

2. Use Zod for validation (min 50 chars)
3. Handle API errors gracefully

Reference: TECHNICAL.md Section 7.3, UIUX.md Section 10
```

**4.14 Tests**

**Agent**: `frontend-test-engineer`
**Prompt**:
```
Write tests for pre-explanation retrieval flow.

Requirements:
1. ConnectionModal.test.tsx:
   - Prompts for hypothesis first
   - Submit disabled until min chars met
   - Locks hypothesis after submit
   - Shows AI explanation
   - Handles API errors

Target: 80% coverage
```

---

### Feature 5: Comprehension Quiz (Day 9-10, ~10 hours)

**4.15 Quiz Trigger Banner**

**Agent**: `ui-component-builder`
**Prompt**:
```
Build the quiz trigger banner that appears after 5 nodes.

Requirements:
1. components/quiz/QuizTriggerBanner.tsx:
   - Listen to interactedNodeIds in Zustand
   - Show banner when size >= 5
   - Slide from top (smooth animation)
   - Message: "Ready to test your understanding?"
   - Buttons: [Start Quiz] [Later]
   - On "Start Quiz": call useGenerateQuiz, redirect to /quiz/[quizId]
   - On "Later": dismiss banner

Reference: UIUX.md Section 10 for banner styling
```

**4.16 Quiz Page**

**Agent**: `nextjs-app-router-architect`
**Prompt**:
```
Create the quiz interface page at app/quiz/[quizId]/page.tsx.

Requirements:
1. Fetch quiz using useQuery (quizId from params)
2. Render QuizInterface component
3. Handle loading/error states

Reference: TECHNICAL.md Section 7.5
```

**4.17 Quiz Interface**

**Agent**: `form-architect`
**Prompt**:
```
Build the quiz interface with question flow.

Requirements:
1. components/quiz/QuizInterface.tsx:
   - Show one question at a time
   - Progress indicator: "Question 2 of 5"
   - Question text
   - Multiple choice options (radio buttons)
   - Submit button (appears after selection)

2. After submission:
   - Show immediate feedback (correct/incorrect)
   - Show explanation
   - Show [Next Question] button

3. After all questions:
   - Call useSubmitQuiz mutation
   - Show QuizResults component

Reference: TECHNICAL.md Section 7.5, UIUX.md for quiz styling
```

**4.18 Quiz Results**

**Agent**: `ui-component-builder`
**Prompt**:
```
Build the quiz results component.

Requirements:
1. components/quiz/QuizResults.tsx:
   - Score display (percentage + X/Y correct)
   - List of questions with results (correct/incorrect)
   - Concepts to review (linked back to graph nodes)
   - [Return to Graph] button

Reference: UIUX.md for results styling
```

**4.19 Tests**

**Agent**: `frontend-test-engineer`
**Prompt**:
```
Write tests for quiz feature.

Requirements:
1. QuizInterface.test.tsx:
   - Displays questions one at a time
   - Submit disabled until option selected
   - Shows feedback after submission
   - Advances to next question
   - Submits answers on completion

2. QuizResults.test.tsx:
   - Displays score correctly
   - Shows review list
   - Links back to graph

Target: 80% coverage
```

**Week 2 Checkpoint**:
- ✅ Users explain connections before seeing AI
- ✅ Quiz triggers after 5 nodes
- ✅ Complete comprehension check flow

---

## Phase 6: Testing & Polish (Day 10-11)

### 6.1 Integration Tests

**Agent**: `frontend-test-engineer`
**Prompt**:
```
Write integration tests for critical user flows.

Requirements:
1. tests/integration/upload-to-graph.test.tsx:
   - Upload document
   - Wait for processing
   - View graph
   - Click node
   - Verify reading panel scrolls

2. tests/integration/note-taking.test.tsx:
   - Click node
   - Open note modal
   - Write note
   - Save to localStorage
   - Verify indicator shows

3. tests/integration/quiz-flow.test.tsx:
   - Interact with 5 nodes
   - Trigger quiz
   - Answer questions
   - View results

Use MSW for all API mocking.
Target: 15% integration coverage
```

### 6.2 Accessibility Audit

**Agent**: `ui-component-builder`
**Prompt**:
```
Audit all components for WCAG AA compliance.

Requirements:
1. Verify color contrast ratios (4.5:1 text, 3:1 UI)
2. Ensure all interactive elements keyboard accessible
3. Add focus indicators (3px teal outline)
4. Add ARIA labels to graph nodes
5. Add ARIA live regions for dynamic updates
6. Test with screen reader

Reference: UIUX.md Section 14 for accessibility requirements
```

### 6.3 Performance Optimization

**Tasks**:
1. Code splitting: Dynamic imports for heavy components
2. Image optimization: Use next/image
3. Bundle analysis: Check bundle size (<150KB initial JS)
4. Lighthouse audit: Target scores >90

### 6.4 Polish

**Tasks**:
1. Loading skeletons for all async states
2. Error boundaries for all pages
3. Empty states (no document, no notes)
4. Toast notifications for success/error
5. Smooth transitions and animations
6. Responsive mobile layout (basic, desktop-first)

---

## Phase 7: Deployment Setup (Day 11-12)

### 7.1 Vercel Configuration

**Tasks**:
1. Create vercel.json
2. Set environment variables in Vercel dashboard
3. Connect GitHub repo
4. Enable preview deployments

### 7.2 CI/CD Pipeline

**Tasks**:
1. GitHub Actions workflow:
   - Lint on PR
   - Type check
   - Run tests
   - Check bundle size

2. Auto-deploy to Vercel on main branch push

### 7.3 Documentation

**Tasks**:
1. Update README.md with setup instructions
2. Document environment variables
3. Add development workflow guide
4. Create CHANGELOG.md

---

## Success Criteria

### Functional Requirements
- ✅ Users can upload documents (file or URL)
- ✅ View generated knowledge graphs
- ✅ Click nodes to read corresponding text
- ✅ Add notes to nodes (localStorage)
- ✅ Explain connections before seeing AI explanation
- ✅ Take comprehension quiz after 5 nodes
- ✅ View quiz results and concepts to review

### Technical Requirements
- ✅ 80% unit test coverage
- ✅ 15% integration test coverage
- ✅ <150KB initial JS bundle
- ✅ <1.5s First Contentful Paint
- ✅ WCAG AA compliance
- ✅ Works on Chrome, Firefox, Safari (latest 2 versions)

### Code Quality
- ✅ All files follow REGULATION.md principles
- ✅ No commented-out code or unused imports
- ✅ Proper file structure with META.md files
- ✅ TypeScript strict mode, no `any` types
- ✅ All sub-agent deliverables reviewed

---

## Risk Mitigation

### Potential Blockers
1. **Mermaid.js performance with large graphs**
   - Mitigation: Test with 20+ node graphs, implement lazy loading if needed

2. **Polling overwhelming server**
   - Mitigation: Exponential backoff, max polling duration

3. **LocalStorage limits (5MB)**
   - Mitigation: Warn user when approaching limit, MVP scope is small

4. **Backend API changes**
   - Mitigation: MSW handlers isolate frontend, update when API stabilizes

---

## Daily Standup Format

**Yesterday**:
- What was completed?
- What tests were written?

**Today**:
- What will be implemented?
- Which sub-agents will be used?

**Blockers**:
- Any issues or questions?

---

## Rollout Strategy

### Week 1 Demo (Day 7)
- Demo: Upload → View graph → Click nodes → Add notes
- Focus: Core learning loop

### Week 2 Demo (Day 12)
- Demo: Full flow including pre-explanation and quiz
- Focus: Active learning features

### Production Deploy (Day 14)
- Deploy to Vercel
- Share with initial testers
- Collect feedback for post-MVP iterations

---

**Version**: 1.0
**Last Updated**: 2025-11-11
**Status**: Ready to begin implementation
