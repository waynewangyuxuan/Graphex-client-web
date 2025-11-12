# API Integration Guide

Complete guide to using the Graphex API integration layer.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [API Client Configuration](#api-client-configuration)
4. [Type Definitions](#type-definitions)
5. [API Functions](#api-functions)
6. [React Query Hooks](#react-query-hooks)
7. [Error Handling](#error-handling)
8. [Polling Strategies](#polling-strategies)
9. [Usage Examples](#usage-examples)
10. [Testing](#testing)

---

## Overview

The API integration layer provides:

- **Type-safe API calls**: Full TypeScript support with shared types
- **Standardized error handling**: Consistent error normalization and user-friendly messages
- **Automatic retries**: Exponential backoff for transient errors
- **Rate limit handling**: Automatic retry on 429 with proper delays
- **Polling support**: Built-in polling for long-running operations
- **Progress tracking**: Upload progress callbacks
- **React Query integration**: Optimized caching and state management

---

## Quick Start

### 1. Install Dependencies

```bash
pnpm add @tanstack/react-query axios
pnpm add -D @types/node
```

### 2. Set Environment Variable

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 3. Setup React Query Provider

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 2,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4. Use Hooks in Components

```typescript
'use client';

import { useUploadDocument } from '@/hooks';

export function FileUploader() {
  const uploadMutation = useUploadDocument({
    onSuccess: (data) => {
      router.push(`/processing?docId=${data.document.id}`);
    },
  });

  const handleUpload = (file: File) => {
    uploadMutation.mutate({ file });
  };

  return (
    <button onClick={() => handleUpload(selectedFile)}>
      Upload
    </button>
  );
}
```

---

## API Client Configuration

### Base Configuration

The Axios client is pre-configured with:

- **Base URL**: From `NEXT_PUBLIC_API_URL` environment variable
- **Timeout**: 30 seconds (default), 5 minutes for uploads
- **Request ID**: Automatic UUID generation for tracing
- **Content-Type**: `application/json` by default

### Request Interceptor

Automatically adds:
- `X-Request-ID` header for request tracing
- Development logging

### Response Interceptor

Handles:
- **Data extraction**: Returns `response.data.data` directly
- **429 Rate Limits**: Automatic retry with exponential backoff
- **Error normalization**: Consistent error structure
- **Development logging**: Request/response logging in dev mode

### Example: Custom Request

```typescript
import apiClient from '@/lib/api-client';

// The client unwraps the response automatically
const data = await apiClient.get('/custom-endpoint');
// data is already response.data.data, not the full Axios response
```

---

## Type Definitions

All types are defined in `/types/api.types.ts`.

### Key Type Exports

```typescript
import type {
  // Documents
  Document,
  DocumentUploadResponse,
  DocumentStatusResponse,

  // Graphs
  Graph,
  GraphNode,
  GraphEdge,
  GraphGenerationResponse,

  // Jobs
  JobStatusResponse,
  JobStatus,

  // Connections
  ConnectionExplanationRequest,
  ConnectionExplanationResponse,

  // Quizzes
  QuizQuestion,
  QuizGenerationResponse,
  QuizSubmissionResponse,

  // API Responses
  APISuccessResponse,
  APIErrorResponse,
} from '@/types/api.types';
```

---

## API Functions

Low-level API functions are in `/lib/api/`:

### Documents (`/lib/api/documents.ts`)

```typescript
import { uploadDocument, getDocument, getDocumentStatus } from '@/lib/api';

// Upload file
const response = await uploadDocument(file, 'My Document', {
  onUploadProgress: (progress) => console.log(`${progress}%`),
});

// Get document
const document = await getDocument('doc_abc123');

// Check status
const status = await getDocumentStatus('doc_abc123');
```

### Graphs (`/lib/api/graphs.ts`)

```typescript
import { generateGraph, getGraph, getJobStatus } from '@/lib/api';

// Start graph generation
const jobResponse = await generateGraph({ documentId: 'doc_abc123' });

// Poll job status
const job = await getJobStatus(jobResponse.jobId);

// Get graph when ready
const graph = await getGraph(job.result.graphId);
```

### Connections (`/lib/api/connections.ts`)

```typescript
import { explainConnection } from '@/lib/api';

// Get explanation
const explanation = await explainConnection({
  fromNodeId: 'node_1',
  toNodeId: 'node_2',
  userHypothesis: 'Optional user hypothesis...',
});
```

### Quizzes (`/lib/api/quizzes.ts`)

```typescript
import { generateQuiz, submitQuiz } from '@/lib/api';

// Generate quiz
const quiz = await generateQuiz({
  graphId: 'graph_abc123',
  difficulty: 'medium',
  count: 5,
});

// Submit answers
const results = await submitQuiz(quiz.quizId, {
  answers: [
    { questionId: 'q1', selectedAnswer: 0 },
    { questionId: 'q2', selectedAnswer: 2 },
  ],
});
```

---

## React Query Hooks

React Query hooks are in `/hooks/`:

### Document Hooks

#### useDocument

```typescript
import { useDocument } from '@/hooks';

const { data: document, isLoading, error } = useDocument('doc_abc123');
```

#### useDocumentStatus (Polling)

```typescript
import { useDocumentStatus } from '@/hooks';

// Automatically polls every 2 seconds while processing
const { data: status } = useDocumentStatus('doc_abc123');

useEffect(() => {
  if (status?.status === 'ready') {
    // Navigate to graph view
  }
}, [status]);
```

#### useUploadDocument

```typescript
import { useUploadDocument } from '@/hooks';

const uploadMutation = useUploadDocument({
  onSuccess: (data) => {
    console.log('Uploaded:', data.document.id);
  },
  onError: (error) => {
    console.error(error.message);
  },
});

// In component
const handleUpload = (file: File) => {
  uploadMutation.mutate(
    { file, title: 'My Document' },
    {
      onUploadProgress: (progress) => setProgress(progress),
    }
  );
};
```

### Graph Hooks

#### useGraph

```typescript
import { useGraph } from '@/hooks';

const { data: graph, isLoading } = useGraph('graph_abc123');
```

#### useGenerateGraph + useJobStatus

```typescript
import { useGenerateGraph, useJobStatus } from '@/hooks';

const [jobId, setJobId] = useState<string | null>(null);

const generateMutation = useGenerateGraph({
  onSuccess: (data) => setJobId(data.jobId),
});

// Automatically polls every 2 seconds while processing
const { data: job } = useJobStatus(jobId);

useEffect(() => {
  if (job?.status === 'completed') {
    router.push(`/graph/${job.result.graphId}`);
  }
}, [job]);
```

#### useGraphGeneration (Composite Hook)

```typescript
import { useGraphGeneration } from '@/hooks';

const { generateGraph, job, isLoading } = useGraphGeneration();

const handleGenerate = () => {
  generateGraph({ documentId: 'doc_abc123' });
};

// Job polling is automatic
useEffect(() => {
  if (job?.status === 'completed') {
    // Handle completion
  }
}, [job]);
```

### Connection Hooks

#### useExplainConnection

```typescript
import { useExplainConnection } from '@/hooks';

const explainMutation = useExplainConnection({
  onSuccess: (data) => {
    console.log(data.explanation);
    console.log(data.userHypothesisEvaluation);
  },
});

const handleExplain = () => {
  explainMutation.mutate({
    fromNodeId: 'node_1',
    toNodeId: 'node_2',
    userHypothesis: 'User hypothesis...',
  });
};
```

### Quiz Hooks

#### useGenerateQuiz

```typescript
import { useGenerateQuiz } from '@/hooks';

const generateQuizMutation = useGenerateQuiz({
  onSuccess: (data) => {
    router.push(`/quiz/${data.quizId}`);
  },
});

const handleStartQuiz = () => {
  generateQuizMutation.mutate({
    graphId: 'graph_abc123',
    difficulty: 'medium',
    count: 5,
  });
};
```

#### useSubmitQuiz

```typescript
import { useSubmitQuiz } from '@/hooks';

const submitMutation = useSubmitQuiz('quiz_abc123', {
  onSuccess: (data) => {
    console.log(`Score: ${data.score}%`);
  },
});

const handleSubmit = (answers: QuizAnswer[]) => {
  submitMutation.mutate({ answers });
};
```

#### useQuizFlow (Composite Hook)

```typescript
import { useQuizFlow } from '@/hooks';

const { generateQuiz, quiz, submitQuiz, results, isLoading } = useQuizFlow('graph_abc123');
```

---

## Error Handling

### Normalized Errors

All errors are normalized to a consistent structure:

```typescript
interface NormalizedAPIError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
  originalError: AxiosError;
}
```

### Error Handling in Components

```typescript
const { data, error, isError } = useDocument('doc_abc123');

if (isError) {
  return (
    <div className="error">
      <h3>Error: {error.code}</h3>
      <p>{error.message}</p>
    </div>
  );
}
```

### User-Friendly Error Messages

```typescript
import { getUserFriendlyErrorMessage } from '@/lib/api-client';

const { error } = useDocument('doc_abc123');

if (error) {
  const message = getUserFriendlyErrorMessage(error);
  toast.error(message);
}
```

### Error Codes

```typescript
import { APIErrorCode } from '@/types/api.types';

if (error.code === APIErrorCode.DOCUMENT_NOT_FOUND) {
  // Handle 404
}
```

---

## Polling Strategies

### Document Status Polling

Polls every 2 seconds while `status === 'processing'`:

```typescript
const { data: status } = useDocumentStatus('doc_abc123');
// Automatically stops when status is 'ready' or 'failed'
```

### Job Status Polling

Polls every 2 seconds while `status === 'queued' || status === 'processing'`:

```typescript
const { data: job } = useJobStatus(jobId);
// Automatically stops when status is 'completed' or 'failed'
```

### Manual Polling Control

```typescript
const { data, refetch } = useDocument('doc_abc123', {
  enabled: false, // Don't auto-fetch
});

// Manually trigger
const handleRefresh = () => refetch();
```

### Pause Polling on Inactive Tab

Polling automatically pauses when the browser tab is inactive:

```typescript
// Built into all polling hooks
refetchIntervalInBackground: false
```

---

## Usage Examples

### Complete Document Upload Flow

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useUploadDocument, useDocumentStatus } from '@/hooks';
import { useRouter } from 'next/navigation';

export function DocumentUploadPage() {
  const router = useRouter();
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadDocument({
    onSuccess: (data) => {
      setDocumentId(data.document.id);
    },
  });

  const { data: status } = useDocumentStatus(documentId);

  useEffect(() => {
    if (status?.status === 'ready') {
      // Document processing complete, navigate to graph
      router.push(`/graph/${status.graphId}`);
    }
  }, [status, router]);

  const handleUpload = (file: File) => {
    uploadMutation.mutate(
      { file },
      {
        onUploadProgress: (progress) => setUploadProgress(progress),
      }
    );
  };

  return (
    <div>
      {!documentId && (
        <FileDropzone onDrop={handleUpload} />
      )}
      {uploadMutation.isLoading && (
        <ProgressBar progress={uploadProgress} label="Uploading..." />
      )}
      {status?.status === 'processing' && (
        <ProgressBar progress={status.progress} label="Processing..." />
      )}
    </div>
  );
}
```

### Complete Graph Generation Flow

```typescript
'use client';

import { useGraphGeneration } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function GraphGenerationPage({ documentId }: { documentId: string }) {
  const router = useRouter();
  const { generateGraph, job, isLoading, error } = useGraphGeneration();

  useEffect(() => {
    // Start generation on mount
    generateGraph({ documentId });
  }, [documentId, generateGraph]);

  useEffect(() => {
    // Navigate when complete
    if (job?.status === 'completed' && job.result?.graphId) {
      router.push(`/graph/${job.result.graphId}`);
    }
  }, [job, router]);

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div>
      <h2>Generating Knowledge Graph</h2>
      <ProgressBar progress={job?.progress || 0} />
      <p>{job?.status || 'Starting...'}</p>
    </div>
  );
}
```

### Connection Explanation with Hypothesis

```typescript
'use client';

import { useState } from 'react';
import { useExplainConnection } from '@/hooks';

export function ConnectionModal({ fromNodeId, toNodeId }) {
  const [hypothesis, setHypothesis] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  const explainMutation = useExplainConnection({
    onSuccess: () => {
      setShowExplanation(true);
    },
  });

  const handleSubmit = () => {
    explainMutation.mutate({
      fromNodeId,
      toNodeId,
      userHypothesis: hypothesis,
    });
  };

  return (
    <div>
      {!showExplanation ? (
        <div>
          <h3>What's the connection?</h3>
          <textarea
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="Write your hypothesis..."
          />
          <button onClick={handleSubmit} disabled={hypothesis.length < 50}>
            Submit
          </button>
        </div>
      ) : (
        <div>
          <h3>Your Hypothesis</h3>
          <p className="text-gray-600">{hypothesis}</p>

          <h3>AI Explanation</h3>
          <p>{explainMutation.data?.explanation}</p>

          {explainMutation.data?.userHypothesisEvaluation && (
            <div>
              <h4>Evaluation: {explainMutation.data.userHypothesisEvaluation.match}</h4>
              <p>{explainMutation.data.userHypothesisEvaluation.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Quiz Flow

```typescript
'use client';

import { useQuizFlow } from '@/hooks';

export function QuizPage({ graphId }: { graphId: string }) {
  const { generateQuiz, quiz, submitQuiz, results, isLoading } = useQuizFlow(graphId);
  const [selectedAnswers, setSelectedAnswers] = useState<QuizAnswer[]>([]);

  const handleStart = () => {
    generateQuiz({ graphId, difficulty: 'medium', count: 5 });
  };

  const handleSubmit = () => {
    submitQuiz({ answers: selectedAnswers });
  };

  if (!quiz) {
    return (
      <button onClick={handleStart} disabled={isLoading}>
        Start Quiz
      </button>
    );
  }

  if (results) {
    return (
      <div>
        <h2>Quiz Results</h2>
        <p>Score: {results.score}%</p>
        <p>Correct: {results.correct} / {results.total}</p>
      </div>
    );
  }

  return (
    <div>
      <QuizQuestions
        questions={quiz.questions}
        onAnswerChange={setSelectedAnswers}
      />
      <button onClick={handleSubmit} disabled={isLoading}>
        Submit Quiz
      </button>
    </div>
  );
}
```

---

## Testing

### Mocking API Functions

```typescript
// __tests__/components/FileUploader.test.tsx
import { uploadDocument } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  uploadDocument: jest.fn(),
}));

test('uploads document on button click', async () => {
  (uploadDocument as jest.Mock).mockResolvedValue({
    document: { id: 'doc_123' },
    jobId: 'job_123',
  });

  // Test component
});
```

### Mocking React Query Hooks

```typescript
import { useUploadDocument } from '@/hooks';

jest.mock('@/hooks', () => ({
  useUploadDocument: jest.fn(),
}));

test('shows loading state during upload', () => {
  (useUploadDocument as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isLoading: true,
  });

  // Test component
});
```

### Using MSW for Integration Tests

```typescript
// __tests__/setup/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.post('/api/v1/documents', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          document: { id: 'doc_123', status: 'processing' },
          jobId: 'job_123',
        },
      })
    );
  })
);
```

---

## Best Practices

1. **Always use hooks over direct API calls** in components
2. **Handle all three states**: loading, error, success
3. **Use optimistic updates** for better UX where appropriate
4. **Invalidate queries** after mutations that affect cached data
5. **Use composite hooks** for complex multi-step flows
6. **Show user-friendly error messages** with `getUserFriendlyErrorMessage`
7. **Set appropriate `staleTime`** based on data volatility
8. **Don't retry mutations** that could cause duplicate submissions
9. **Pause polling** when tab is inactive to save resources
10. **Log errors properly** for debugging

---

## Troubleshooting

### Query not fetching

- Check `enabled` option (should be `true`)
- Verify query key is correct
- Check network tab for actual request

### Polling not stopping

- Verify `refetchInterval` logic
- Check that data status matches termination condition
- Ensure `refetchIntervalInBackground: false` is set

### 429 Rate Limit errors

- Check `X-RateLimit-*` headers in response
- Reduce request frequency
- Wait for `retryAfter` duration

### Type errors

- Ensure all types are imported from `@/types/api.types`
- Check that response matches expected type
- Verify generic types on hooks

---

**Version**: 1.0
**Last Updated**: 2025-11-11
**Related**: Server_API_Reference.md, TECHNICAL.md
