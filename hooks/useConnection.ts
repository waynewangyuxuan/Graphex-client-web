/**
 * Connection React Query Hooks
 *
 * React Query hooks for connection explanations (edges between nodes).
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { explainConnection } from '@/lib/api/connections';
import type {
  ConnectionExplanationRequest,
  ConnectionExplanationResponse,
} from '@/types/api.types';
import type { NormalizedAPIError } from '@/lib/api-client';

// ============================================================================
// useExplainConnection - Get Connection Explanation Mutation
// ============================================================================

/**
 * Get AI explanation for a connection between nodes
 *
 * This implements the "pre-explanation retrieval" flow:
 * 1. User clicks edge
 * 2. User writes hypothesis (optional)
 * 3. AI provides explanation with optional hypothesis evaluation
 *
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * // Basic usage without hypothesis
 * const explainMutation = useExplainConnection({
 *   onSuccess: (data) => {
 *     console.log(data.explanation);
 *   }
 * });
 *
 * const handleExplain = () => {
 *   explainMutation.mutate({
 *     fromNodeId: 'node_1',
 *     toNodeId: 'node_2'
 *   });
 * };
 *
 * // With hypothesis for evaluation
 * const handleExplainWithHypothesis = () => {
 *   explainMutation.mutate({
 *     fromNodeId: 'node_1',
 *     toNodeId: 'node_2',
 *     userHypothesis: 'I think these concepts are related because...'
 *   });
 * };
 *
 * // Display in component
 * if (explainMutation.isLoading) return <Spinner />;
 * if (explainMutation.data) {
 *   return (
 *     <div>
 *       <h3>AI Explanation</h3>
 *       <p>{explainMutation.data.explanation}</p>
 *       {explainMutation.data.userHypothesisEvaluation && (
 *         <div>
 *           <h4>Your Hypothesis: {explainMutation.data.userHypothesisEvaluation.match}</h4>
 *           <p>{explainMutation.data.userHypothesisEvaluation.feedback}</p>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useExplainConnection(
  options?: UseMutationOptions<
    ConnectionExplanationResponse,
    NormalizedAPIError,
    ConnectionExplanationRequest
  >
) {
  return useMutation<
    ConnectionExplanationResponse,
    NormalizedAPIError,
    ConnectionExplanationRequest
  >({
    mutationFn: (request) => explainConnection(request),
    retry: false, // Don't retry explanation requests
    ...options,
  });
}
