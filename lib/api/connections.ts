/**
 * Connection API Functions
 *
 * API functions for connection explanations (edges between nodes).
 */

import apiClient from '@/lib/api-client';
import type {
  ConnectionExplanationRequest,
  ConnectionExplanationResponse,
} from '@/types/api.types';

// ============================================================================
// Explain Connection
// ============================================================================

/**
 * Get AI explanation for a connection between nodes
 *
 * This implements the "pre-explanation retrieval" flow:
 * 1. User clicks edge
 * 2. User writes hypothesis
 * 3. AI provides explanation with evaluation
 *
 * @param request - Connection explanation request with node IDs and optional hypothesis
 * @returns AI explanation with source references and hypothesis evaluation
 *
 * @example
 * ```typescript
 * // Without hypothesis (just get explanation)
 * const explanation = await explainConnection({
 *   fromNodeId: 'node_1',
 *   toNodeId: 'node_2'
 * });
 *
 * // With hypothesis (get explanation + evaluation)
 * const explanation = await explainConnection({
 *   fromNodeId: 'node_1',
 *   toNodeId: 'node_2',
 *   userHypothesis: 'I think these concepts are related because...'
 * });
 * console.log(explanation.userHypothesisEvaluation?.match); // "partial"
 * ```
 */
export async function explainConnection(
  request: ConnectionExplanationRequest
): Promise<ConnectionExplanationResponse> {
  return apiClient.post<
    ConnectionExplanationRequest,
    ConnectionExplanationResponse
  >('/connections/explain', request);
}
