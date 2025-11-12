/**
 * MSW Handlers Tests
 *
 * Tests for Mock Service Worker handlers to ensure they correctly
 * simulate API behavior.
 */

import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

// Start server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after tests
afterAll(() => server.close());

describe('MSW Handlers', () => {
  // ============================================================================
  // Health Checks
  // ============================================================================

  describe('Health Endpoints', () => {
    it('should respond to health check', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('ok');
      expect(data.meta.timestamp).toBeDefined();
      expect(data.meta.requestId).toBeDefined();
    });

    it('should respond to readiness check', async () => {
      const response = await fetch(`${BASE_URL}/health/ready`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.checks.database).toBe('ok');
      expect(data.data.checks.redis).toBe('ok');
    });

    it('should respond to deep health check', async () => {
      const response = await fetch(`${BASE_URL}/health/deep`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.checks.database).toBe('ok');
      expect(data.data.checks.redis).toBe('ok');
      expect(data.data.checks.anthropic).toBe('ok');
      expect(data.data.checks.openai).toBe('ok');
    });
  });

  // ============================================================================
  // Documents
  // ============================================================================

  describe('Document Endpoints', () => {
    it('should upload a document', async () => {
      const formData = new FormData();
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      formData.append('file', file);
      formData.append('title', 'Test Document');

      const response = await fetch(`${BASE_URL}/documents`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.data.document).toBeDefined();
      expect(data.data.document.title).toBe('Test Document');
      expect(data.data.document.status).toBe('processing');
      expect(data.data.jobId).toBeDefined();
    });

    it('should reject document upload without file', async () => {
      const formData = new FormData();
      formData.append('title', 'No File');

      const response = await fetch(`${BASE_URL}/documents`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
      expect(data.error.message).toBe('File is required');
    });

    it('should create document from URL', async () => {
      const response = await fetch(`${BASE_URL}/documents/from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com/article',
          title: 'Web Article',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.data.document.sourceType).toBe('url');
      expect(data.data.document.sourceUrl).toBe('https://example.com/article');
      expect(data.data.document.title).toBe('Web Article');
    });

    it('should reject invalid URL', async () => {
      const response = await fetch(`${BASE_URL}/documents/from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'not-a-valid-url',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should get document by ID', async () => {
      const response = await fetch(`${BASE_URL}/documents/doc_123`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('doc_123');
      expect(data.data.title).toBeDefined();
      expect(data.data.contentText).toBeDefined();
    });

    it('should return 404 for non-existent document', async () => {
      const response = await fetch(`${BASE_URL}/documents/doc_notfound`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('DOCUMENT_NOT_FOUND');
    });

    it('should get document status', async () => {
      const response = await fetch(`${BASE_URL}/documents/doc_123/status`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBeDefined();
      expect(data.data.progress).toBeGreaterThanOrEqual(0);
      expect(data.data.progress).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // Graphs
  // ============================================================================

  describe('Graph Endpoints', () => {
    it('should start graph generation', async () => {
      const response = await fetch(`${BASE_URL}/graphs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'doc_123',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.data.jobId).toBeDefined();
      expect(data.data.status).toBe('queued');
      expect(data.data.estimatedTime).toBeDefined();
    });

    it('should reject graph generation without documentId', async () => {
      const response = await fetch(`${BASE_URL}/graphs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should get graph by ID', async () => {
      const response = await fetch(`${BASE_URL}/graphs/graph_123`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('graph_123');
      expect(data.data.mermaidCode).toBeDefined();
      expect(data.data.nodes).toBeInstanceOf(Array);
      expect(data.data.edges).toBeInstanceOf(Array);
      expect(data.data.nodes.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent graph', async () => {
      const response = await fetch(`${BASE_URL}/graphs/graph_notfound`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('GRAPH_NOT_FOUND');
    });

    it('should get job status', async () => {
      const response = await fetch(`${BASE_URL}/jobs/job_123`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('job_123');
      expect(data.data.status).toBeDefined();
      expect(['queued', 'processing', 'completed', 'failed']).toContain(
        data.data.status
      );
    });
  });

  // ============================================================================
  // Connections
  // ============================================================================

  describe('Connection Endpoints', () => {
    it('should explain connection between nodes', async () => {
      const response = await fetch(`${BASE_URL}/connections/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromNodeId: 'node_1',
          toNodeId: 'node_2',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.fromNode).toBe('node_1');
      expect(data.data.toNode).toBe('node_2');
      expect(data.data.explanation).toBeDefined();
      expect(data.data.relationship).toBeDefined();
      expect(data.data.sourceReferences).toBeInstanceOf(Array);
    });

    it('should include hypothesis evaluation when provided', async () => {
      const response = await fetch(`${BASE_URL}/connections/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromNodeId: 'node_1',
          toNodeId: 'node_2',
          userHypothesis: 'These concepts are related through engagement',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userHypothesisEvaluation).toBeDefined();
      expect(data.data.userHypothesisEvaluation.match).toBeDefined();
      expect(data.data.userHypothesisEvaluation.feedback).toBeDefined();
    });

    it('should reject connection explanation without required fields', async () => {
      const response = await fetch(`${BASE_URL}/connections/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromNodeId: 'node_1',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });
  });

  // ============================================================================
  // Quizzes
  // ============================================================================

  describe('Quiz Endpoints', () => {
    it('should generate quiz questions', async () => {
      const response = await fetch(`${BASE_URL}/quizzes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graphId: 'graph_123',
          difficulty: 'medium',
          count: 5,
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.quizId).toBeDefined();
      expect(data.data.questions).toBeInstanceOf(Array);
      expect(data.data.questions.length).toBeGreaterThan(0);
      expect(data.data.questions[0].questionText).toBeDefined();
      expect(data.data.questions[0].options).toBeInstanceOf(Array);
      expect(data.data.questions[0].correctAnswer).toBeDefined();
    });

    it('should reject quiz generation without graphId', async () => {
      const response = await fetch(`${BASE_URL}/quizzes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: 'easy',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should submit quiz answers and get results', async () => {
      const response = await fetch(`${BASE_URL}/quizzes/quiz_123/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: [
            { questionId: 'q1', selectedAnswer: 0 },
            { questionId: 'q2', selectedAnswer: 1 },
          ],
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.score).toBeDefined();
      expect(data.data.correct).toBeDefined();
      expect(data.data.total).toBe(2);
      expect(data.data.results).toBeInstanceOf(Array);
      expect(data.data.results).toHaveLength(2);
    });

    it('should reject quiz submission without answers', async () => {
      const response = await fetch(`${BASE_URL}/quizzes/quiz_123/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });
  });

  // ============================================================================
  // Notes
  // ============================================================================

  describe('Note Endpoints', () => {
    it('should create a note', async () => {
      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graphId: 'graph_123',
          nodeId: 'node_1',
          content: 'This is a test note',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.graphId).toBe('graph_123');
      expect(data.data.nodeId).toBe('node_1');
      expect(data.data.content).toBe('This is a test note');
      expect(data.data.createdAt).toBeDefined();
    });

    it('should reject note creation without required fields', async () => {
      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graphId: 'graph_123',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should get notes for a graph', async () => {
      const response = await fetch(`${BASE_URL}/notes?graphId=graph_abc123`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should reject notes query without graphId', async () => {
      const response = await fetch(`${BASE_URL}/notes`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should update a note', async () => {
      const response = await fetch(`${BASE_URL}/notes/note_123`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Updated note content',
        }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('note_123');
      expect(data.data.content).toBe('Updated note content');
      expect(data.data.updatedAt).toBeDefined();
    });

    it('should delete a note', async () => {
      const response = await fetch(`${BASE_URL}/notes/note_123`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
      expect(response.body).toBe(null);
    });
  });

  // ============================================================================
  // Error Scenarios
  // ============================================================================

  describe('Error Scenarios', () => {
    it('should simulate rate limit exceeded', async () => {
      const response = await fetch(`${BASE_URL}/graphs/generate-ratelimit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: 'doc_123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should simulate AI service unavailable', async () => {
      const response = await fetch(`${BASE_URL}/connections/explain-unavailable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromNodeId: 'node_1', toNodeId: 'node_2' }),
      });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AI_SERVICE_UNAVAILABLE');
    });

    it('should simulate document processing failed', async () => {
      const response = await fetch(`${BASE_URL}/documents/doc_failed/status`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.status).toBe('failed');
      expect(data.data.errorMessage).toBeDefined();
    });
  });

  // ============================================================================
  // Response Format
  // ============================================================================

  describe('Response Format', () => {
    it('should return standardized success response', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(data.meta).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('requestId');
    });

    it('should return standardized error response', async () => {
      const response = await fetch(`${BASE_URL}/documents/doc_notfound`);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
      expect(data).toHaveProperty('meta');
    });
  });
});
