/**
 * Quiz API Functions
 *
 * API functions for quiz generation and submission.
 */

import apiClient from '@/lib/api-client';
import type {
  QuizGenerationRequest,
  QuizGenerationResponse,
  QuizSubmissionRequest,
  QuizSubmissionResponse,
} from '@/types/api.types';

// ============================================================================
// Generate Quiz
// ============================================================================

/**
 * Generate quiz questions from a graph
 *
 * Typically called after user has interacted with 5+ nodes.
 *
 * @param request - Quiz generation request with graph ID and options
 * @returns Quiz ID and questions
 *
 * @example
 * ```typescript
 * const quiz = await generateQuiz({
 *   graphId: 'graph_abc123',
 *   difficulty: 'medium',
 *   count: 5
 * });
 * console.log(quiz.questions);
 * ```
 */
export async function generateQuiz(
  request: QuizGenerationRequest
): Promise<QuizGenerationResponse> {
  return apiClient.post<QuizGenerationRequest, QuizGenerationResponse>(
    '/quizzes/generate',
    request
  );
}

// ============================================================================
// Submit Quiz
// ============================================================================

/**
 * Submit quiz answers and get results
 *
 * @param quizId - Quiz ID
 * @param request - Quiz submission with answers
 * @returns Quiz results with score and feedback
 *
 * @example
 * ```typescript
 * const results = await submitQuiz('quiz_abc123', {
 *   answers: [
 *     { questionId: 'q1', selectedAnswer: 0 },
 *     { questionId: 'q2', selectedAnswer: 2 }
 *   ]
 * });
 * console.log(results.score); // 80
 * console.log(results.results); // Individual question results
 * ```
 */
export async function submitQuiz(
  quizId: string,
  request: QuizSubmissionRequest
): Promise<QuizSubmissionResponse> {
  return apiClient.post<QuizSubmissionRequest, QuizSubmissionResponse>(
    `/quizzes/${quizId}/submit`,
    request
  );
}
