# Web Client Technical Design Document

## Knowledge Graph Learning Platform - Frontend System

**Version:** 1.0  
**Last Updated:** November 11, 2025  
**Status:** Living Document

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Application Structure](#4-application-structure)
5. [State Management](#5-state-management)
6. [API Integration](#6-api-integration)
7. [Feature Implementation](#7-feature-implementation)
8. [UI Component System](#8-ui-component-system)
9. [Graph Visualization](#9-graph-visualization)
10. [Document Viewing](#10-document-viewing)
11. [File Structure](#11-file-structure)
12. [Performance Optimization](#12-performance-optimization)
13. [Error Handling](#13-error-handling)
14. [Accessibility](#14-accessibility)
15. [Deployment](#15-deployment)
16. [Testing Strategy](#16-testing-strategy)

---

## 1. System Overview

### 1.1 Purpose

The web client provides an interactive interface for users to upload documents, visualize knowledge graphs, read content with graph-guided navigation, take notes, and verify understanding through quizzes.

### 1.2 Core Responsibilities

- **Document Upload**: File upload and URL submission with progress tracking
- **Graph Visualization**: Render interactive Mermaid-based knowledge graphs
- **Reading Interface**: Display source documents with synchronized highlighting
- **Note Management**: Create and manage notes on nodes (local storage for MVP)
- **Pre-Explanation Flow**: Capture user hypotheses before showing AI explanations
- **Quiz Interface**: Present comprehension questions and provide feedback
- **Polling & Status**: Track long-running server operations (document processing, graph generation)

### 1.3 Key User Flows (MVP)

```
Flow 1: Document Upload → Graph View
├── Upload file or submit URL
├── Poll for processing status
├── View generated graph
└── Click nodes to read content

Flow 2: Active Learning
├── Click node → Read passage
├── Add note to node
├── Click edge → Write hypothesis
├── See AI explanation
└── Take quiz after 5 nodes

Flow 3: Note-Taking
├── Click node
├── Open note modal
├── Write notes (local storage)
└── See note indicators on nodes
```

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           Browser Environment                │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │      Next.js App Router (React 18)     │ │
│  │                                         │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │     Page Components (Routes)     │  │ │
│  │  │  • / (upload)                    │  │ │
│  │  │  • /graph/[id] (viewer)          │  │ │
│  │  │  • /quiz/[id] (quiz)             │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │                                         │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │    Feature Components             │  │ │
│  │  │  • GraphCanvas                    │  │ │
│  │  │  • ReadingPanel                   │  │ │
│  │  │  • NoteModal                      │  │ │
│  │  │  • ConnectionModal                │  │ │
│  │  │  • QuizInterface                  │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │                                         │ │
│  │  ┌───────────┬──────────────────────┐  │ │
│  │  │ UI State  │  Server State        │  │ │
│  │  │ (Zustand) │  (React Query)       │  │ │
│  │  └───────────┴──────────────────────┘  │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │     Local Storage (MVP Notes)        │   │
│  └──────────────────────────────────────┘   │
└─────────────────┬────────────────────────────┘
                  │ HTTPS/REST
                  ▼
        ┌──────────────────┐
        │   Backend API    │
        │   (Express.js)   │
        └──────────────────┘
```

### 2.2 Architecture Patterns

- **Component-Based**: Modular React components with clear responsibilities
- **Server Components First**: Use Next.js RSC for initial page loads
- **Client State Separation**: UI state (Zustand) vs Server state (React Query)
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Progressive Enhancement**: Works with JavaScript (no-JS fallback post-MVP)
- **Responsive but Desktop-First**: Optimized for 1280px+ screens

### 2.3 Design Principles

1. **Performance**: Fast initial load, lazy loading, code splitting
2. **Type Safety**: Full TypeScript, shared types with backend
3. **Accessibility**: WCAG AA compliance, keyboard navigation
4. **Offline Resilience**: Handle network failures gracefully
5. **Developer Experience**: Hot reload, clear error messages, good tooling

---

## 3. Technology Stack

### 3.1 Core Framework

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Framework | Next.js (App Router) | 14+ | RSC, built-in routing, optimal for React |
| UI Library | React | 18+ | Industry standard, huge ecosystem |
| Language | TypeScript | 5+ | Type safety, shared types with backend |
| Package Manager | pnpm | 8+ | Fast, efficient, strict dependency management |
| Build Tool | Turbopack (Next.js) | Built-in | Zero config, optimized for Next.js |

### 3.2 State Management

| Type | Library | Purpose |
|------|---------|---------|
| Client UI State | Zustand | Modal states, selections, UI preferences |
| Server State | React Query (TanStack Query) | API data fetching, caching, mutations |
| Form State | React Hook Form | Forms, validation, submission |

**Why This Split:**
- Zustand: Lightweight (2KB), no provider hell, simple API
- React Query: Best-in-class server state management, handles caching/refetching
- React Hook Form: Performant forms, minimal re-renders

### 3.3 Styling & UI

| Component | Technology | Purpose |
|-----------|-----------|---------|
| CSS Framework | Tailwind CSS | Utility-first, design system, fast iteration |
| Component Primitives | Radix UI | Accessible, unstyled, composable (Dialog, Popover) |
| Icons | Lucide React | Clean, consistent, tree-shakeable, 1000+ icons |
| Animations | Framer Motion | Declarative, smooth transitions, gesture support |
| Fonts | next/font | Optimized web fonts, self-hosted |

### 3.4 Visualization & Content

| Feature | Technology | Notes |
|---------|-----------|-------|
| Graph Rendering | Mermaid.js | MVP - Text-based, AI-friendly, quick implementation |
| Future Graph | React Flow | Post-MVP for drag/drop interactivity |
| PDF Viewing | react-pdf | Display PDFs in browser (if needed) |
| Markdown | react-markdown | Render markdown documents |

### 3.5 Data & Utilities

- **HTTP Client**: Axios (wrapped in React Query)
- **File Upload**: react-dropzone (drag & drop, validation)
- **Validation**: Zod (shared schemas with backend)
- **Date Handling**: date-fns (lightweight, tree-shakeable)
- **Class Names**: clsx (conditional classes)
- **Dev Tools**: React Query DevTools, Zustand DevTools

---

## 4. Application Structure

### 4.1 Routing (Next.js App Router)

```
app/
├── page.tsx                           # Landing + upload page
├── layout.tsx                         # Root layout (providers, fonts)
├── globals.css                        # Tailwind + custom styles
│
├── graph/
│   └── [graphId]/
│       ├── page.tsx                   # Graph viewer (main app)
│       ├── loading.tsx                # Loading skeleton
│       └── error.tsx                  # Error boundary
│
├── processing/
│   └── page.tsx                       # Processing status page (polls server)
│
├── quiz/
│   └── [quizId]/
│       └── page.tsx                   # Quiz interface
│
└── api/                               # Optional proxy routes (if needed)
    └── upload/
        └── route.ts                   # Handle file upload (proxy to backend)
```

### 4.2 Page Responsibilities

**`/` (Landing/Upload)**
- File upload dropzone
- URL input form
- Sample document links
- Redirect to `/processing` after upload

**`/processing`**
- Poll document status (GET `/documents/:id/status`)
- Show progress bar
- Redirect to `/graph/[id]` when ready

**`/graph/[graphId]`**
- Main application interface
- Graph canvas (left 60%)
- Reading panel (right 40%)
- Note modal
- Connection explanation modal
- Quiz trigger (after 5 nodes)

**`/quiz/[quizId]`**
- Display quiz questions
- Collect answers
- Show results
- Link back to graph

---

## 5. State Management

### 5.1 State Classification

**Client State (Zustand)** - UI-only, ephemeral:
```typescript
interface AppStore {
  // Graph interactions
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  interactedNodeIds: Set<string>;     // Track for quiz trigger
  
  // Modals
  noteModalOpen: boolean;
  connectionModalOpen: boolean;
  activeConnectionId: string | null;
  
  // UI preferences
  readingPanelWidth: number;          // Resizable panel
  
  // Actions
  selectNode: (id: string | null) => void;
  addInteractedNode: (id: string) => void;
  openNoteModal: () => void;
  closeNoteModal: () => void;
  // ...
}
```

**Server State (React Query)** - Data from backend:
```typescript
// Queries (read operations)
useQuery(['document', documentId])      // Fetch document
useQuery(['graph', graphId])            // Fetch graph
useQuery(['document-status', docId])    // Poll processing status
useQuery(['job-status', jobId])         // Poll job status
useQuery(['connection', edgeId])        // Fetch connection explanation
useQuery(['quiz', quizId])              // Fetch quiz

// Mutations (write operations)
useMutation(uploadDocument)             // Upload file
useMutation(generateGraph)              // Request graph generation
useMutation(explainConnection)          // Get connection explanation
useMutation(submitQuiz)                 // Submit quiz answers
```

**Local Storage (MVP)** - Persistent, client-only:
```typescript
// Notes stored in browser
notes: {
  [graphId]: {
    [nodeId]: {
      content: string;
      createdAt: string;
      updatedAt: string;
    }
  }
}
```

### 5.2 Data Flow Pattern

```
User Action (e.g., click node)
     ↓
1. Update UI State (Zustand) - Immediate
   └── selectedNodeId = nodeId
     ↓
2. Side Effects (if needed)
   ├── Scroll reading panel
   ├── Highlight text
   └── Mark as interacted
     ↓
3. Server Interaction (if needed)
   └── React Query mutation
       ├── Optimistic update (instant UI)
       ├── Send request
       └── Update cache on response
```

### 5.3 Cache Configuration

```typescript
// React Query default config
{
  queries: {
    staleTime: 5 * 60 * 1000,        // 5 min - data fresh
    cacheTime: 10 * 60 * 1000,       // 10 min - keep in memory
    refetchOnWindowFocus: false,     // Don't refetch on tab switch
    retry: 2,                         // Retry failed requests 2x
  },
  mutations: {
    retry: 1,                         // Retry mutations once
  }
}
```

**Cache Invalidation Strategy:**
- Upload document → Invalidate no cache (new data)
- Graph generated → Invalidate `['graph', graphId]`
- Note saved → Update local storage only (no server for MVP)
- Quiz submitted → Invalidate `['quiz', quizId]` if retakeable

---

## 6. API Integration

### 6.1 API Client Configuration

**Base Setup:**
```typescript
// lib/api-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request ID for tracing
apiClient.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
});

// Global error handling
apiClient.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    // Handle specific error codes
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait...');
    }
    return Promise.reject(error);
  }
);
```

### 6.2 API Hooks (React Query)

**Document Operations:**
```typescript
// hooks/useDocument.ts
export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: () => api.getDocument(documentId),
    enabled: !!documentId,
  });
}

export function useDocumentStatus(documentId: string) {
  return useQuery({
    queryKey: ['document-status', documentId],
    queryFn: () => api.getDocumentStatus(documentId),
    refetchInterval: (data) => {
      // Stop polling when ready or failed
      return data?.status === 'processing' ? 2000 : false;
    },
    enabled: !!documentId,
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: (file: File) => api.uploadDocument(file),
    onSuccess: (data) => {
      // Redirect to processing page
      router.push(`/processing?docId=${data.documentId}`);
    },
  });
}
```

**Graph Operations:**
```typescript
// hooks/useGraph.ts
export function useGraph(graphId: string) {
  return useQuery({
    queryKey: ['graph', graphId],
    queryFn: () => api.getGraph(graphId),
    enabled: !!graphId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useJobStatus(jobId: string) {
  return useQuery({
    queryKey: ['job-status', jobId],
    queryFn: () => api.getJobStatus(jobId),
    refetchInterval: (data) => {
      return data?.status !== 'completed' && data?.status !== 'failed' ? 2000 : false;
    },
    enabled: !!jobId,
  });
}
```

**Connection Explanations:**
```typescript
// hooks/useConnection.ts
export function useExplainConnection() {
  return useMutation({
    mutationFn: ({ edgeId, userHypothesis }: ExplainConnectionInput) => 
      api.explainConnection(edgeId, userHypothesis),
  });
}
```

### 6.3 Polling Strategy

**Use Case**: Document processing, graph generation

**Implementation Pattern:**
```typescript
// Poll every 2 seconds while status is "processing"
const { data: status } = useQuery({
  queryKey: ['document-status', documentId],
  queryFn: () => fetchStatus(documentId),
  refetchInterval: (data) => {
    if (!data) return 2000;
    if (data.status === 'processing') return 2000;
    return false; // Stop polling
  },
});

// Redirect when ready
useEffect(() => {
  if (status?.status === 'ready') {
    router.push(`/graph/${status.graphId}`);
  }
}, [status]);
```

### 6.4 Error Handling

**Global Error Handler:**
```typescript
function handleAPIError(error: AxiosError) {
  if (error.response?.status === 404) {
    return 'Resource not found';
  }
  if (error.response?.status === 429) {
    return 'Too many requests. Please wait.';
  }
  if (error.response?.status >= 500) {
    return 'Server error. Please try again.';
  }
  return 'Something went wrong';
}
```

**Per-Request Error Handling:**
```typescript
const { error, isError } = useGraph(graphId);

if (isError) {
  return <ErrorState message={handleAPIError(error)} />;
}
```

---

## 7. Feature Implementation

### 7.1 Document Upload Flow

```
User Action: Drop file or click upload
     ↓
1. Validation (client-side)
   - Check file type (PDF, TXT, MD)
   - Check file size (< 10MB)
   - Show error if invalid
     ↓
2. Show upload progress
   - Display file name
   - Progress bar
     ↓
3. API call: POST /documents
   - multipart/form-data
   - Response: { documentId, status: "processing" }
     ↓
4. Redirect to /processing?docId=xxx
     ↓
5. Poll status every 2 seconds
   - GET /documents/:id/status
   - Show progress: "Processing... 30%"
     ↓
6. On status = "ready"
   - Redirect to /graph/:graphId
```

**Component Structure:**
```
FileUploader
├── Dropzone (react-dropzone)
├── FileList (show selected files)
├── UploadButton
└── ProgressBar (while uploading)
```

### 7.2 Graph Visualization Flow

```
Page Load: /graph/[graphId]
     ↓
1. Fetch graph data
   - GET /graphs/:graphId
   - Response: { mermaidCode, nodes[], edges[] }
     ↓
2. Render Mermaid graph
   - Parse mermaidCode
   - Render SVG
   - Attach event listeners
     ↓
3. User clicks node
     ↓
4. Update state (Zustand)
   - selectedNodeId = nodeId
   - Add to interactedNodeIds
     ↓
5. Side effects
   - Scroll reading panel to relevant section
   - Highlight text
   - Show note indicator (if note exists)
     ↓
6. Check quiz trigger
   - If interactedNodeIds.size >= 5
   - Show quiz banner
```

**Component Structure:**
```
GraphViewerPage
├── GraphCanvas
│   ├── MermaidRenderer (client component)
│   └── NodeInteractionLayer
├── ReadingPanel
│   ├── DocumentContent
│   └── TextHighlighter
├── NoteModal (Radix Dialog)
├── ConnectionModal (Radix Dialog)
└── QuizTriggerBanner
```

### 7.3 Pre-Explanation Retrieval Flow

```
User clicks edge/connection
     ↓
1. Open ConnectionModal
   - Show edge info (from node → to node)
     ↓
2. Prompt user
   - "What do you think this relationship is?"
   - Textarea (min 15 words)
     ↓
3. User types hypothesis
   - Character counter
   - Enable submit button when >= 15 words
     ↓
4. User submits
   - Lock input (read-only)
   - Show loading spinner
     ↓
5. API call: POST /connections/explain
   - Body: { edgeId, userHypothesis }
     ↓
6. Display AI explanation
   - Show hypothesis (grayed out)
   - Show AI explanation
   - Show source text excerpts
     ↓
7. Prompt self-explanation
   - "Now explain in your own words"
   - Optional: Save to note
```

**Component Structure:**
```
ConnectionModal
├── EdgeInfo (display from/to nodes)
├── HypothesisInput (user's guess)
├── SubmitButton
├── AIExplanation (after submission)
├── SourceTextDisplay
└── SelfExplanationPrompt
```

### 7.4 Note Management (Local Storage)

```
User clicks node → "Add Note"
     ↓
1. Open NoteModal
   - Pre-fill with existing note (if any)
     ↓
2. User writes note
   - Auto-save every 2 seconds
   - Save to localStorage
     ↓
3. Close modal
   - Show note indicator on node
     ↓
Storage format:
{
  "graph-abc123": {
    "node-1": {
      "content": "This is my note...",
      "createdAt": "2025-11-11T10:00:00Z",
      "updatedAt": "2025-11-11T10:05:00Z"
    }
  }
}
```

**Note:** MVP uses localStorage. Post-MVP will sync to server via API.

### 7.5 Quiz Flow

```
Trigger: After 5 nodes interacted
     ↓
1. Show quiz banner
   - "Ready to test your understanding?"
   - [Start Quiz] [Later]
     ↓
2. User clicks "Start Quiz"
     ↓
3. API call: POST /quizzes/generate
   - Body: { graphId, nodeIds: [...interactedNodeIds] }
   - Response: { quizId, questions[] }
     ↓
4. Redirect to /quiz/:quizId
     ↓
5. Display questions (one at a time)
   - Question text
   - Multiple choice options
   - [Submit Answer] button
     ↓
6. User submits answer
   - Show immediate feedback (correct/incorrect)
   - Show explanation
   - [Next Question] button
     ↓
7. After all questions
   - Show score
   - Show concepts to review
   - [Return to Graph] button
```

**Component Structure:**
```
QuizInterface
├── QuizQuestion
│   ├── QuestionText
│   ├── OptionsList
│   └── SubmitButton
├── QuestionFeedback
│   ├── CorrectIndicator
│   └── Explanation
└── QuizResults
    ├── ScoreDisplay
    ├── ReviewList
    └── ReturnButton
```

---

## 8. UI Component System

### 8.1 Design System (Tailwind Config)

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
        amber: {
          DEFAULT: '#D4A574',
        },
        slate: {
          blue: '#7B92A8',
        },
        sage: '#8FA387',
        terracotta: '#C89B7B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Charter', 'Georgia', 'serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
};
```

### 8.2 Reusable UI Components

**Button Component:**
```typescript
// components/ui/Button.tsx
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

// Primary: bg-teal text-white
// Secondary: border-teal text-teal
// Ghost: text-teal hover:bg-teal/10
```

**Modal Component (Radix Dialog wrapper):**
```typescript
// components/ui/Modal.tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 max-w-2xl">
      {children}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Input Component:**
```typescript
// components/ui/Input.tsx
<input 
  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
  {...props}
/>
```

**Spinner Component:**
```typescript
// components/ui/Spinner.tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal" />
```

### 8.3 Layout Components

**Container:**
```typescript
<div className="max-w-7xl mx-auto px-6">
  {children}
</div>
```

**Split View (Graph + Reading):**
```typescript
<div className="flex h-screen">
  <div className="w-3/5 bg-canvas">{/* Graph */}</div>
  <div className="w-2/5 bg-background overflow-y-auto">{/* Reading */}</div>
</div>
```

---

## 9. Graph Visualization

### 9.1 Mermaid.js Integration

**Why Mermaid for MVP:**
- Text-based (AI can generate easily)
- Automatic layout (no manual positioning)
- Simple integration
- Good enough for MVP

**Implementation:**
```typescript
// components/graph/MermaidRenderer.tsx
'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export function MermaidRenderer({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({ 
        startOnLoad: false,
        theme: 'neutral',
        themeVariables: {
          primaryColor: '#7B92A8',
          primaryBorderColor: '#2C5F6F',
        }
      });
      
      mermaid.render('graph-svg', code).then(({ svg }) => {
        containerRef.current!.innerHTML = svg;
        attachClickHandlers();
      });
    }
  }, [code]);
  
  function attachClickHandlers() {
    // Add click listeners to nodes/edges in SVG
    const nodes = containerRef.current?.querySelectorAll('.node');
    nodes?.forEach(node => {
      node.addEventListener('click', handleNodeClick);
    });
  }
  
  return <div ref={containerRef} className="w-full h-full" />;
}
```

### 9.2 Graph Interactions

**Node Click:**
1. Get node ID from SVG element
2. Update Zustand state (selectedNodeId)
3. Trigger side effects (scroll, highlight)
4. Visual feedback (border change)

**Edge Click:**
1. Get edge ID from SVG element
2. Open ConnectionModal
3. Load edge data (from/to nodes)

**Hover Effects:**
- Subtle highlight on hover
- Show tooltip with node title
- Highlight connected nodes

### 9.3 Graph State Tracking

```typescript
// Track which nodes user has interacted with
const { interactedNodeIds, addInteractedNode } = useAppStore();

function handleNodeClick(nodeId: string) {
  addInteractedNode(nodeId);
  
  // Trigger quiz after 5 nodes
  if (interactedNodeIds.size >= 5) {
    showQuizBanner();
  }
}
```

---

## 10. Document Viewing

### 10.1 Reading Panel Structure

```
ReadingPanel
├── Document metadata (title, source)
├── Scrollable content area
│   ├── Highlighted sections (based on selected node)
│   └── Full document text
└── Scroll-to-top button
```

### 10.2 Text Highlighting

**Strategy:**
```typescript
// When node clicked, highlight relevant passage
function highlightNodeContent(nodeId: string) {
  const node = graph.nodes.find(n => n.id === nodeId);
  const refs = node.document_refs; // [{ start, end, text }]
  
  // Scroll to position
  scrollToPosition(refs[0].start);
  
  // Apply highlight
  highlightRange(refs[0].start, refs[0].end);
}
```

**Implementation:**
```typescript
// Use CSS class for highlighting
<span className="bg-amber/30 transition-colors duration-300">
  {highlightedText}
</span>
```

### 10.3 Synchronized Scrolling

**Node Click → Scroll to Text:**
```typescript
function scrollToNodeContent(nodeId: string) {
  const position = getNodeTextPosition(nodeId);
  
  readingPanelRef.current?.scrollTo({
    top: position,
    behavior: 'smooth'
  });
}
```

**Breadcrumb Navigation:**
```
Document Title > Section > Specific Passage
```

---

## 11. File Structure

```
web/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Landing/upload
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Tailwind + custom styles
│   ├── providers.tsx                 # React Query, Zustand providers
│   │
│   ├── graph/
│   │   └── [graphId]/
│   │       ├── page.tsx              # Graph viewer
│   │       └── loading.tsx
│   │
│   ├── processing/
│   │   └── page.tsx                  # Status polling page
│   │
│   └── quiz/
│       └── [quizId]/
│           └── page.tsx              # Quiz interface
│
├── components/
│   ├── graph/
│   │   ├── GraphCanvas.tsx
│   │   ├── MermaidRenderer.tsx
│   │   └── NodeInteractionLayer.tsx
│   │
│   ├── reading/
│   │   ├── ReadingPanel.tsx
│   │   ├── DocumentViewer.tsx
│   │   └── TextHighlighter.tsx
│   │
│   ├── notes/
│   │   ├── NoteModal.tsx
│   │   └── NoteForm.tsx
│   │
│   ├── connection/
│   │   ├── ConnectionModal.tsx
│   │   ├── HypothesisInput.tsx
│   │   └── ExplanationDisplay.tsx
│   │
│   ├── quiz/
│   │   ├── QuizInterface.tsx
│   │   ├── QuizQuestion.tsx
│   │   └── QuizResults.tsx
│   │
│   ├── upload/
│   │   ├── FileUploader.tsx
│   │   ├── URLUploader.tsx
│   │   └── UploadProgress.tsx
│   │
│   └── ui/                           # Reusable UI components
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Input.tsx
│       ├── Spinner.tsx
│       └── Toast.tsx
│
├── hooks/
│   ├── useGraph.ts                   # Graph data fetching
│   ├── useDocument.ts                # Document operations
│   ├── useNotes.ts                   # Note CRUD (localStorage)
│   ├── useQuiz.ts                    # Quiz operations
│   ├── useUpload.ts                  # File upload
│   └── useConnection.ts              # Connection explanations
│
├── lib/
│   ├── api-client.ts                 # Axios setup
│   ├── api/                          # API call functions
│   │   ├── documents.ts
│   │   ├── graphs.ts
│   │   ├── connections.ts
│   │   └── quizzes.ts
│   ├── local-storage.ts              # localStorage helpers
│   └── utils.ts                      # Helper functions
│
├── stores/
│   └── app-store.ts                  # Zustand store
│
├── types/
│   ├── graph.types.ts
│   ├── document.types.ts
│   ├── note.types.ts
│   └── api.types.ts
│
├── styles/
│   └── mermaid-custom.css            # Custom Mermaid styles
│
├── public/
│   └── fonts/
│
├── .env.local
├── .env.production
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 12. Performance Optimization

### 12.1 Code Splitting

**Route-Based (Automatic):**
- Next.js automatically splits by route
- Each page is a separate bundle

**Component-Based (Dynamic Imports):**
```typescript
// Lazy load heavy components
const MermaidRenderer = dynamic(
  () => import('./MermaidRenderer'),
  { 
    loading: () => <Spinner />,
    ssr: false  // Mermaid requires browser
  }
);

const QuizInterface = dynamic(
  () => import('./QuizInterface'),
  { loading: () => <Spinner /> }
);
```

### 12.2 Data Fetching Optimization

**Prefetching:**
```typescript
// Prefetch graph data on hover
<Link 
  href={`/graph/${graphId}`}
  onMouseEnter={() => queryClient.prefetchQuery(['graph', graphId])}
>
  View Graph
</Link>
```

**Optimistic Updates:**
```typescript
// Instant UI feedback before server response
const saveNoteMutation = useMutation({
  mutationFn: saveNote,
  onMutate: async (newNote) => {
    // Cancel outgoing requests
    await queryClient.cancelQueries(['notes', graphId]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['notes', graphId]);
    
    // Optimistically update
    queryClient.setQueryData(['notes', graphId], (old) => [...old, newNote]);
    
    return { previous };
  },
  onError: (err, newNote, context) => {
    // Rollback on error
    queryClient.setQueryData(['notes', graphId], context.previous);
  },
});
```

### 12.3 Image & Asset Optimization

**Fonts:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});
```

**Images (if any):**
```typescript
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={50}
  priority  // Load immediately
/>
```

### 12.4 Bundle Size Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial JS | < 150KB gzipped | Code splitting, tree shaking |
| First Contentful Paint | < 1.5s | Server components, font optimization |
| Time to Interactive | < 3s | Minimal JS, defer non-critical |
| Largest Contentful Paint | < 2.5s | Optimize images, preload critical assets |

---

## 13. Error Handling

### 13.1 Error Boundary

```typescript
// app/error.tsx
'use client';

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### 13.2 API Error Handling

**React Query Error States:**
```typescript
const { data, error, isError, isLoading } = useGraph(graphId);

if (isLoading) return <LoadingSkeleton />;
if (isError) return <ErrorState error={error} />;
return <GraphViewer data={data} />;
```

**Toast Notifications:**
```typescript
// Show user-friendly error messages
function handleAPIError(error: AxiosError) {
  const message = error.response?.data?.error?.message || 'Something went wrong';
  toast.error(message);
}
```

### 13.3 Network Failure Handling

**Offline Detection:**
```typescript
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);
  
  return isOnline;
}

// Show banner when offline
{!isOnline && <OfflineBanner />}
```

**Retry Logic (React Query):**
```typescript
useQuery({
  queryKey: ['graph', graphId],
  queryFn: fetchGraph,
  retry: 2,                    // Retry 2 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 13.4 Form Validation Errors

```typescript
// React Hook Form + Zod
const schema = z.object({
  hypothesis: z.string().min(50, 'Please write at least 50 characters'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});

// Display errors
{errors.hypothesis && (
  <span className="text-red-500 text-sm">{errors.hypothesis.message}</span>
)}
```

---

## 14. Accessibility

### 14.1 WCAG AA Compliance

**Color Contrast:**
- Text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Keyboard Navigation:**
- All interactive elements tabbable
- Clear focus indicators (3px teal outline)
- Logical tab order
- Keyboard shortcuts (optional):
  - `N` - Add note
  - `ESC` - Close modal
  - Arrow keys - Navigate graph nodes

### 14.2 ARIA Attributes

**Modal:**
```typescript
<Dialog.Root>
  <Dialog.Content 
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <Dialog.Title id="dialog-title">Add Note</Dialog.Title>
    <Dialog.Description id="dialog-description">
      Write your thoughts about this concept
    </Dialog.Description>
  </Dialog.Content>
</Dialog.Root>
```

**Graph Nodes:**
```typescript
<g 
  role="button"
  tabIndex={0}
  aria-label={`Concept: ${node.title}. Click to view details.`}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  {/* SVG node */}
</g>
```

**Loading States:**
```typescript
<div role="status" aria-live="polite">
  <Spinner />
  <span className="sr-only">Loading graph...</span>
</div>
```

### 14.3 Focus Management

**Modal Opens:**
```typescript
// Focus first input when modal opens
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);
```

**Modal Closes:**
```typescript
// Return focus to trigger element
const triggerRef = useRef<HTMLButtonElement>(null);

function closeModal() {
  setIsOpen(false);
  triggerRef.current?.focus();
}
```

### 14.4 Screen Reader Support

**Announcements:**
```typescript
// Announce dynamic updates
<div role="status" aria-live="polite" className="sr-only">
  {status === 'saving' && 'Saving note...'}
  {status === 'saved' && 'Note saved successfully'}
</div>
```

**Skip Links:**
```typescript
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-teal text-white p-4"
>
  Skip to main content
</a>
```

---

## 15. Deployment

### 15.1 Deployment Platform: Vercel

**Why Vercel:**
- Zero-config Next.js deployment
- Automatic preview deployments for PRs
- Global CDN (fast worldwide)
- Built-in analytics
- Free tier sufficient for MVP

### 15.2 Deployment Environments

| Environment | Trigger | URL | Purpose |
|-------------|---------|-----|---------|
| Development | Local | localhost:3000 | Developer testing |
| Preview | PR created | preview-[hash].vercel.app | Stakeholder review |
| Production | Push to `main` | app.yourdomain.com | Live users |

### 15.3 Environment Variables

**Required Variables:**
```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# .env.production (Vercel dashboard)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

**Variable Naming:**
- `NEXT_PUBLIC_*` - Exposed to browser
- Others - Server-side only (not exposed)

### 15.4 Build Configuration

**next.config.js:**
```javascript
module.exports = {
  reactStrictMode: true,
  
  // Enable Turbopack (dev only)
  experimental: {
    turbo: {},
  },
  
  // Image optimization
  images: {
    domains: ['yourdomain.com'],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};
```

### 15.5 CI/CD Pipeline (GitHub Actions)

**Workflow:**
```yaml
name: Web Client CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  lint:
    - ESLint
    - TypeScript check
    - Prettier
    
  test:
    - Run Jest tests
    - Upload coverage
    
  build:
    - next build
    - Check bundle size
    
  deploy:
    - Auto-deploy to Vercel (on main)
    - Comment deployment URL on PR
```

### 15.6 Performance Monitoring

**Vercel Analytics:**
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Page load times

**Optional: Sentry**
- Error tracking
- Performance monitoring
- User session replay

---

## 16. Testing Strategy

### 16.1 Testing Pyramid

```
        E2E Tests (5%)
      /              \
  Integration Tests (15%)
 /                      \
Unit Tests (80%)
```

### 16.2 Unit Testing

**Tool:** Jest + React Testing Library

**What to Test:**
- Utility functions
- Custom hooks
- Component logic (not visual)

**Example:**
```typescript
// lib/utils.test.ts
describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-11-11');
    expect(formatDate(date)).toBe('Nov 11, 2025');
  });
});

// hooks/useGraph.test.ts
describe('useGraph', () => {
  it('fetches graph data', async () => {
    const { result } = renderHook(() => useGraph('graph-123'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### 16.3 Integration Testing

**Tool:** Jest + MSW (Mock Service Worker)

**What to Test:**
- API integration
- State management flows
- Multi-component interactions

**Example:**
```typescript
// Mock API responses
const server = setupServer(
  rest.get('/api/v1/graphs/:id', (req, res, ctx) => {
    return res(ctx.json({ id: '123', nodes: [...] }));
  })
);

test('loads and displays graph', async () => {
  render(<GraphViewer graphId="123" />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
```

### 16.4 E2E Testing (Post-MVP)

**Tool:** Playwright

**Critical Paths to Test:**
1. Upload document → View graph
2. Click node → Read passage → Add note
3. Click edge → Write hypothesis → See explanation
4. Take quiz → Submit answers → View results

### 16.5 Coverage Targets

- Unit tests: 80% coverage
- Integration tests: Critical paths covered
- E2E tests: Happy path covered

---

## Appendix A: Technology Decision Matrix

| Decision Point | Choice | Alternatives | Rationale |
|----------------|--------|--------------|-----------|
| Framework | Next.js 14 | Remix, Vite+React | Best React framework, RSC, Vercel deployment |
| State (UI) | Zustand | Redux, Jotai | Simplest, smallest, no boilerplate |
| State (Server) | React Query | SWR, Apollo | Best caching, devtools, type safety |
| Styling | Tailwind | CSS Modules, Emotion | Fastest iteration, design system |
| Components | Radix UI | HeadlessUI, MUI | Accessible, unstyled, composable |
| Graph | Mermaid.js | D3, React Flow, Cytoscape | AI-friendly, quick MVP implementation |
| Forms | React Hook Form | Formik | Better performance, smaller bundle |

---

## Appendix B: MVP vs Post-MVP Features

### MVP (Included)
- ✅ Document upload (file + URL)
- ✅ Graph visualization (Mermaid)
- ✅ Click nodes to read
- ✅ Add notes (localStorage)
- ✅ Pre-explanation retrieval flow
- ✅ Basic quiz

### Post-MVP (Future)
- ⏭ Drag & drop graph rearrangement (React Flow)
- ⏭ Server-synced notes
- ⏭ Spaced repetition system
- ⏭ Multi-document synthesis
- ⏭ Dark mode
- ⏭ Mobile-optimized interface
- ⏭ Collaborative features
- ⏭ Export graph as image

---

## Appendix C: Browser Support

**Target Browsers (MVP):**
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions

**Not Supported:**
- Internet Explorer
- Opera Mini
- UC Browser

---

## Appendix D: Performance Budgets

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| Initial JS Bundle | 150KB | TBD | - |
| CSS Bundle | 50KB | TBD | - |
| First Contentful Paint | 1.5s | TBD | - |
| Time to Interactive | 3.0s | TBD | - |
| Largest Contentful Paint | 2.5s | TBD | - |

---

**Document Status:**
- **Version**: 1.0
- **Next Review**: After MVP deployment
- **Maintainer**: Frontend Team
- **Related Docs**: Server-Side Technical Design Document

---

**End of Web Client Technical Design Document**