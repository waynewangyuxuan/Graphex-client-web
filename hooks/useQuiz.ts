/**
 * Quiz React Query Hooks
 *
 * React Query hooks for quiz operations:
 * - useGenerateQuiz: Generate quiz questions mutation
 * - useSubmitQuiz: Submit quiz answers mutation
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { generateQuiz, submitQuiz } from '@/lib/api/quizzes';
import type {
  QuizGenerationRequest,
  QuizGenerationResponse,
  QuizSubmissionRequest,
  QuizSubmissionResponse,
} from '@/types/api.types';
import type { NormalizedAPIError } from '@/lib/api-client';

// ============================================================================
// Query Keys
// ============================================================================

/**
 * Query key factory for quiz-related queries
 */
export const quizKeys = {
  all: ['quizzes'] as const,
  detail: (id: string) => [...quizKeys.all, id] as const,
  results: (id: string) => [...quizKeys.all, id, 'results'] as const,
};

// ============================================================================
// useGenerateQuiz - Generate Quiz Mutation
// ============================================================================

/**
 * Generate quiz questions from a graph
 *
 * Typically called after user has interacted with 5+ nodes.
 *
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * const generateQuizMutation = useGenerateQuiz({
 *   onSuccess: (data) => {
 *     router.push(`/quiz/${data.quizId}`);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleStartQuiz = () => {
 *   generateQuizMutation.mutate({
 *     graphId: 'graph_abc123',
 *     difficulty: 'medium',
 *     count: 5
 *   });
 * };
 *
 * return (
 *   <button
 *     onClick={handleStartQuiz}
 *     disabled={generateQuizMutation.isLoading}
 *   >
 *     {generateQuizMutation.isLoading ? 'Generating...' : 'Start Quiz'}
 *   </button>
 * );
 * ```
 */
export function useGenerateQuiz(
  options?: UseMutationOptions<
    QuizGenerationResponse,
    NormalizedAPIError,
    QuizGenerationRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    QuizGenerationResponse,
    NormalizedAPIError,
    QuizGenerationRequest
  >({
    mutationFn: (request) => generateQuiz(request),
    onSuccess: (data) => {
      // Cache the generated quiz
      queryClient.setQueryData(quizKeys.detail(data.quizId), data);
    },
    retry: false, // Don't retry quiz generation
    ...options,
  });
}

// ============================================================================
// useSubmitQuiz - Submit Quiz Mutation
// ============================================================================

/**
 * Submit quiz answers and get results
 *
 * @param quizId - Quiz ID
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * const submitQuizMutation = useSubmitQuiz('quiz_abc123', {
 *   onSuccess: (data) => {
 *     console.log(`Score: ${data.score}%`);
 *     // Show results page
 *   }
 * });
 *
 * const handleSubmit = (answers: QuizAnswer[]) => {
 *   submitQuizMutation.mutate({ answers });
 * };
 *
 * return (
 *   <div>
 *     <QuizQuestions />
 *     <button
 *       onClick={() => handleSubmit(selectedAnswers)}
 *       disabled={submitQuizMutation.isLoading}
 *     >
 *       Submit Quiz
 *     </button>
 *     {submitQuizMutation.data && (
 *       <QuizResults results={submitQuizMutation.data} />
 *     )}
 *   </div>
 * );
 * ```
 */
export function useSubmitQuiz(
  quizId: string,
  options?: UseMutationOptions<
    QuizSubmissionResponse,
    NormalizedAPIError,
    QuizSubmissionRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    QuizSubmissionResponse,
    NormalizedAPIError,
    QuizSubmissionRequest
  >({
    mutationFn: (request) => submitQuiz(quizId, request),
    onSuccess: (data) => {
      // Cache the quiz results
      queryClient.setQueryData(quizKeys.results(quizId), data);
    },
    retry: false, // Don't retry quiz submission (avoid duplicate submissions)
    ...options,
  });
}

// ============================================================================
// Composite Hook: useQuizFlow
// ============================================================================

/**
 * Combined hook for complete quiz flow
 *
 * Handles quiz generation, question display, and submission.
 *
 * @param graphId - Graph ID to generate quiz from
 * @returns Quiz generation and submission functions with state
 *
 * @example
 * ```typescript
 * const {
 *   generateQuiz,
 *   quiz,
 *   submitQuiz,
 *   results,
 *   isGenerating,
 *   isSubmitting,
 * } = useQuizFlow('graph_abc123');
 *
 * const handleStart = () => {
 *   generateQuiz({ graphId: 'graph_abc123', difficulty: 'medium', count: 5 });
 * };
 *
 * const handleSubmit = (answers: QuizAnswer[]) => {
 *   submitQuiz({ answers });
 * };
 *
 * return (
 *   <div>
 *     {!quiz && (
 *       <button onClick={handleStart} disabled={isGenerating}>
 *         Start Quiz
 *       </button>
 *     )}
 *     {quiz && !results && (
 *       <QuizInterface questions={quiz.questions} onSubmit={handleSubmit} />
 *     )}
 *     {results && <QuizResults results={results} />}
 *   </div>
 * );
 * ```
 */
export function useQuizFlow(graphId: string) {
  const generateMutation = useGenerateQuiz();
  const submitMutation = useSubmitQuiz(
    generateMutation.data?.quizId || '',
    {
      enabled: !!generateMutation.data?.quizId,
    }
  );

  return {
    // Quiz generation
    generateQuiz: generateMutation.mutate,
    generateQuizAsync: generateMutation.mutateAsync,
    quiz: generateMutation.data,
    isGenerating: generateMutation.isLoading,
    generateError: generateMutation.error,

    // Quiz submission
    submitQuiz: submitMutation.mutate,
    submitQuizAsync: submitMutation.mutateAsync,
    results: submitMutation.data,
    isSubmitting: submitMutation.isLoading,
    submitError: submitMutation.error,

    // Combined states
    isLoading: generateMutation.isLoading || submitMutation.isLoading,
    error: generateMutation.error || submitMutation.error,
  };
}
