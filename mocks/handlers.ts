/**
 * MSW Request Handlers
 *
 * Mock Service Worker handlers for all Graphex API endpoints.
 * Simulates realistic API behavior including delays, state transitions,
 * and error scenarios.
 */

import { http, HttpResponse, delay } from 'msw';
import {
  mockDocument,
  mockGraph,
  mockQuiz,
  mockNotes,
  mockConnectionExplanation,
  mockJobStates,
  mockDocumentStatuses,
  mockId,
  mockTimestamp,
} from './data';

// Use the same base URL as the API client
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Simulate realistic network delay
 */
const simulateDelay = async (min = 500, max = 2000) => {
  const delayMs = Math.floor(Math.random() * (max - min + 1)) + min;
  await delay(delayMs);
};

/**
 * Create standardized success response
 */
const successResponse = <T>(data: T, status = 200) => {
  return HttpResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: mockTimestamp(),
        requestId: mockId(),
      },
    },
    { status }
  );
};

/**
 * Create standardized error response
 */
const errorResponse = (
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
) => {
  return HttpResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: mockTimestamp(),
        requestId: mockId(),
      },
    },
    { status }
  );
};

/**
 * In-memory state for simulating async operations
 * In a real app, this would be handled by the backend
 */
const state = {
  jobProgress: new Map<string, number>(),
  documentProgress: new Map<string, number>(),
};

export const handlers = [
  // ============================================================================
  // Health Checks
  // ============================================================================

  http.get(`${BASE_URL}/health`, async () => {
    await simulateDelay(100, 300);
    console.log('[MSW] GET /health');

    return successResponse({
      status: 'ok',
      timestamp: mockTimestamp(),
    });
  }),

  http.get(`${BASE_URL}/health/ready`, async () => {
    await simulateDelay(100, 300);
    console.log('[MSW] GET /health/ready');

    return successResponse({
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
    });
  }),

  http.get(`${BASE_URL}/health/deep`, async () => {
    await simulateDelay(200, 500);
    console.log('[MSW] GET /health/deep');

    return successResponse({
      status: 'healthy',
      checks: {
        database: 'ok',
        redis: 'ok',
        anthropic: 'ok',
        openai: 'ok',
      },
    });
  }),

  // ============================================================================
  // Documents
  // ============================================================================

  http.post(`${BASE_URL}/documents`, async ({ request }) => {
    await simulateDelay();
    console.log('[MSW] POST /documents');

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Untitled Document';

    // Validation
    if (!file) {
      return errorResponse('INVALID_REQUEST', 'File is required', 400);
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse('FILE_TOO_LARGE', 'File exceeds 10MB limit', 400);
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        'UNSUPPORTED_FORMAT',
        'Only PDF, TXT, and MD files are supported',
        400
      );
    }

    const docId = mockId('doc');
    const jobId = mockId('job');

    // Initialize document progress tracking
    state.documentProgress.set(docId, 0);

    // Simulate gradual progress
    setTimeout(() => state.documentProgress.set(docId, 50), 1000);
    setTimeout(() => state.documentProgress.set(docId, 100), 2000);

    return successResponse(
      {
        document: {
          id: docId,
          title,
          sourceType: file.type.includes('pdf') ? 'pdf' : 'text',
          status: 'processing',
          createdAt: mockTimestamp(),
        },
        jobId,
      },
      202
    );
  }),

  http.post(`${BASE_URL}/documents/from-url`, async ({ request }) => {
    await simulateDelay();
    console.log('[MSW] POST /documents/from-url');

    const body = (await request.json()) as { url: string; title?: string };

    // Validation
    if (!body.url) {
      return errorResponse('INVALID_REQUEST', 'URL is required', 400);
    }

    try {
      new URL(body.url);
    } catch {
      return errorResponse('INVALID_REQUEST', 'Invalid URL format', 400);
    }

    const docId = mockId('doc');
    const jobId = mockId('job');

    // Initialize document progress tracking
    state.documentProgress.set(docId, 0);
    setTimeout(() => state.documentProgress.set(docId, 50), 1500);
    setTimeout(() => state.documentProgress.set(docId, 100), 3000);

    return successResponse(
      {
        document: {
          id: docId,
          title: body.title || 'Web Article',
          sourceType: 'url',
          sourceUrl: body.url,
          status: 'processing',
          createdAt: mockTimestamp(),
        },
        jobId,
      },
      202
    );
  }),

  http.get(`${BASE_URL}/documents/:id`, async ({ params }) => {
    await simulateDelay();
    const { id } = params;
    console.log(`[MSW] GET /documents/${id}`);

    // Simulate document not found
    if (id === 'doc_notfound') {
      return errorResponse('DOCUMENT_NOT_FOUND', 'Document not found', 404);
    }

    return successResponse({
      ...mockDocument,
      id: id as string,
    });
  }),

  http.get(`${BASE_URL}/documents/:id/status`, async ({ params }) => {
    await simulateDelay(300, 800);
    const { id } = params;
    console.log(`[MSW] GET /documents/${id}/status`);

    // Get current progress or default to ready
    const progress = state.documentProgress.get(id as string);

    if (progress === undefined || progress === 100) {
      return successResponse(mockDocumentStatuses.ready);
    }

    if (progress > 0) {
      return successResponse({
        id: id as string,
        status: 'processing',
        progress,
        errorMessage: null,
      });
    }

    return successResponse({
      id: id as string,
      status: 'processing',
      progress: 0,
      errorMessage: null,
    });
  }),

  // ============================================================================
  // Graphs
  // ============================================================================

  http.post(`${BASE_URL}/graphs/generate`, async ({ request }) => {
    await simulateDelay(500, 1000);
    console.log('[MSW] POST /graphs/generate');

    const body = (await request.json()) as { documentId: string };

    // Validation
    if (!body.documentId) {
      return errorResponse('INVALID_REQUEST', 'documentId is required', 400);
    }

    const jobId = mockId('job_graph');

    // Initialize job progress tracking
    state.jobProgress.set(jobId, 0);

    // Simulate gradual progress: queued → processing → completed
    setTimeout(() => state.jobProgress.set(jobId, 25), 1000);
    setTimeout(() => state.jobProgress.set(jobId, 50), 2000);
    setTimeout(() => state.jobProgress.set(jobId, 75), 3000);
    setTimeout(() => state.jobProgress.set(jobId, 100), 4000);

    return successResponse(
      {
        jobId,
        status: 'queued',
        estimatedTime: '1-3 minutes',
      },
      202
    );
  }),

  http.get(`${BASE_URL}/graphs/:id`, async ({ params }) => {
    await simulateDelay();
    const { id } = params;
    console.log(`[MSW] GET /graphs/${id}`);

    // Simulate graph not found
    if (id === 'graph_notfound') {
      return errorResponse('GRAPH_NOT_FOUND', 'Graph not found', 404);
    }

    return successResponse({
      ...mockGraph,
      id: id as string,
    });
  }),

  http.get(`${BASE_URL}/jobs/:id`, async ({ params }) => {
    await simulateDelay(300, 800);
    const { id } = params;
    console.log(`[MSW] GET /jobs/${id}`);

    // Get current progress or default to completed
    const progress = state.jobProgress.get(id as string);

    if (progress === undefined || progress === 100) {
      return successResponse({
        ...mockJobStates.completed,
        id: id as string,
      });
    }

    if (progress >= 50) {
      return successResponse({
        ...mockJobStates.processing,
        id: id as string,
        progress,
      });
    }

    return successResponse({
      ...mockJobStates.queued,
      id: id as string,
      progress,
    });
  }),

  // ============================================================================
  // Connections
  // ============================================================================

  http.post(`${BASE_URL}/connections/explain`, async ({ request }) => {
    await simulateDelay(1000, 2000); // AI requests take longer
    console.log('[MSW] POST /connections/explain');

    const body = (await request.json()) as {
      fromNodeId: string;
      toNodeId: string;
      userHypothesis?: string;
    };

    // Validation
    if (!body.fromNodeId || !body.toNodeId) {
      return errorResponse(
        'INVALID_REQUEST',
        'fromNodeId and toNodeId are required',
        400
      );
    }

    const response = {
      ...mockConnectionExplanation,
      fromNode: body.fromNodeId,
      toNode: body.toNodeId,
    };

    // Add hypothesis evaluation if provided
    if (body.userHypothesis) {
      response.userHypothesisEvaluation = {
        match: 'partial' as const,
        feedback: `You correctly identified that engagement is important for critical thinking. Your hypothesis "${body.userHypothesis}" captures the active nature of this relationship. To deepen your understanding, also consider how the iterative nature of engagement creates multiple opportunities for developing analytical skills.`,
      };
    }

    return successResponse(response);
  }),

  // ============================================================================
  // Quizzes
  // ============================================================================

  http.post(`${BASE_URL}/quizzes/generate`, async ({ request }) => {
    await simulateDelay(1500, 2500); // AI generation takes time
    console.log('[MSW] POST /quizzes/generate');

    const body = (await request.json()) as {
      graphId: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      count?: number;
    };

    // Validation
    if (!body.graphId) {
      return errorResponse('INVALID_REQUEST', 'graphId is required', 400);
    }

    const count = body.count || 5;
    const difficulty = body.difficulty || 'medium';

    // Filter questions by difficulty and take requested count
    const filteredQuestions = mockQuiz.questions
      .filter((q) => q.difficulty === difficulty)
      .slice(0, count);

    // If not enough questions of that difficulty, add from all difficulties
    if (filteredQuestions.length < count) {
      const remaining = mockQuiz.questions
        .filter((q) => !filteredQuestions.includes(q))
        .slice(0, count - filteredQuestions.length);
      filteredQuestions.push(...remaining);
    }

    return successResponse({
      quizId: mockId('quiz'),
      questions: filteredQuestions,
    });
  }),

  http.post(`${BASE_URL}/quizzes/:id/submit`, async ({ request, params }) => {
    await simulateDelay(500, 1000);
    const { id } = params;
    console.log(`[MSW] POST /quizzes/${id}/submit`);

    const body = (await request.json()) as {
      answers: Array<{ questionId: string; selectedAnswer: number }>;
    };

    // Validation
    if (!body.answers || !Array.isArray(body.answers)) {
      return errorResponse('INVALID_REQUEST', 'answers array is required', 400);
    }

    // Calculate results
    const results = body.answers.map((answer) => {
      const question = mockQuiz.questions.find((q) => q.id === answer.questionId);

      if (!question) {
        return {
          questionId: answer.questionId,
          correct: false,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: 0,
          explanation: 'Question not found',
        };
      }

      const isCorrect = answer.selectedAnswer === question.correctAnswer;

      return {
        questionId: answer.questionId,
        correct: isCorrect,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    });

    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const score = Math.round((correct / total) * 100);

    return successResponse({
      score,
      correct,
      total,
      results,
    });
  }),

  // ============================================================================
  // Notes
  // ============================================================================

  http.post(`${BASE_URL}/notes`, async ({ request }) => {
    await simulateDelay(300, 700);
    console.log('[MSW] POST /notes');

    const body = (await request.json()) as {
      graphId: string;
      nodeId?: string;
      edgeId?: string;
      content: string;
    };

    // Validation
    if (!body.graphId || !body.content) {
      return errorResponse(
        'INVALID_REQUEST',
        'graphId and content are required',
        400
      );
    }

    const now = mockTimestamp();
    const newNote = {
      id: mockId('note'),
      graphId: body.graphId,
      nodeId: body.nodeId || null,
      edgeId: body.edgeId || null,
      content: body.content,
      createdAt: now,
      updatedAt: now,
    };

    return successResponse(newNote, 201);
  }),

  http.get(`${BASE_URL}/notes`, async ({ request }) => {
    await simulateDelay(300, 700);
    console.log('[MSW] GET /notes');

    const url = new URL(request.url);
    const graphId = url.searchParams.get('graphId');

    if (!graphId) {
      return errorResponse('INVALID_REQUEST', 'graphId query param is required', 400);
    }

    // Filter notes by graphId
    const filteredNotes = mockNotes.filter((note) => note.graphId === graphId);

    return successResponse(filteredNotes);
  }),

  http.put(`${BASE_URL}/notes/:id`, async ({ request, params }) => {
    await simulateDelay(300, 700);
    const { id } = params;
    console.log(`[MSW] PUT /notes/${id}`);

    const body = (await request.json()) as { content: string };

    // Validation
    if (!body.content) {
      return errorResponse('INVALID_REQUEST', 'content is required', 400);
    }

    return successResponse({
      id: id as string,
      content: body.content,
      updatedAt: mockTimestamp(),
    });
  }),

  http.delete(`${BASE_URL}/notes/:id`, async ({ params }) => {
    await simulateDelay(300, 700);
    const { id } = params;
    console.log(`[MSW] DELETE /notes/${id}`);

    return new HttpResponse(null, { status: 204 });
  }),

  // ============================================================================
  // Error Scenarios (for testing)
  // ============================================================================

  // Simulate rate limit exceeded (use special ID 'ratelimit' to trigger)
  http.post(`${BASE_URL}/graphs/generate-ratelimit`, async () => {
    await simulateDelay(100, 300);
    console.log('[MSW] Rate limit triggered');

    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          details: {
            retryAfter: 3600,
          },
        },
        meta: {
          timestamp: mockTimestamp(),
          requestId: mockId(),
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
        },
      }
    );
  }),

  // Simulate AI service unavailable (use special ID 'unavailable' to trigger)
  http.post(`${BASE_URL}/connections/explain-unavailable`, async () => {
    await simulateDelay(2000, 3000);
    console.log('[MSW] AI service unavailable');

    return errorResponse(
      'AI_SERVICE_UNAVAILABLE',
      'AI service is temporarily unavailable. Please try again later.',
      503
    );
  }),

  // Simulate processing failed (use special ID 'failed' to trigger)
  http.get(`${BASE_URL}/documents/doc_failed/status`, async () => {
    await simulateDelay();
    console.log('[MSW] Document processing failed');

    return successResponse(mockDocumentStatuses.failed);
  }),
];
