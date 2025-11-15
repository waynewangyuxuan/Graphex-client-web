/**
 * Graph API Functions
 *
 * API functions for graph generation, retrieval, and job status polling.
 */

import apiClient from '@/lib/api-client';
import type {
  Graph,
  GraphGenerationRequest,
  GraphGenerationResponse,
  JobStatusResponse,
} from '@/types/api.types';

// ============================================================================
// Generate Graph
// ============================================================================

/**
 * Start graph generation from a document (async operation)
 *
 * This initiates an async job. Use the returned jobId to poll for completion
 * with getJobStatus().
 *
 * @param request - Graph generation request with document ID
 * @returns Job ID and initial status
 *
 * @example
 * ```typescript
 * const response = await generateGraph({ documentId: 'doc_abc123' });
 * console.log(response.jobId); // "job_graph_123"
 * // Now poll getJobStatus(jobId) until status is "completed"
 * ```
 */
export async function generateGraph(
  request: GraphGenerationRequest
): Promise<GraphGenerationResponse> {
  return apiClient.post<GraphGenerationRequest, GraphGenerationResponse>(
    '/graphs/generate',
    request
  );
}

// ============================================================================
// Get Graph
// ============================================================================

/**
 * Get generated graph data
 *
 * @param graphId - Graph ID
 * @returns Complete graph object with nodes, edges, and Mermaid code
 *
 * @example
 * ```typescript
 * const graph = await getGraph('graph_abc123');
 * console.log(graph.mermaidCode);
 * console.log(graph.nodes);
 * ```
 */
export async function getGraph(graphId: string): Promise<Graph> {
  console.log('[getGraph] Requesting graph:', graphId);
  const result = await apiClient.get<never, Graph>(`/graphs/${graphId}`);
  console.log('[getGraph] Response received:', result?.id, 'nodes:', result?.nodes?.length);
  return result;
}

// ============================================================================
// Get Job Status
// ============================================================================

/**
 * Check job status for async operations (for polling)
 *
 * Use this endpoint to poll for job completion (graph generation, document processing).
 * Poll every 2 seconds while status is "queued" or "processing".
 *
 * @param jobId - Job ID from async operation
 * @returns Job status with progress and result
 *
 * @example
 * ```typescript
 * const job = await getJobStatus('job_graph_123');
 * if (job.status === 'completed') {
 *   const graphId = job.result.graphId;
 *   // Now fetch the graph with getGraph(graphId)
 * }
 * ```
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  return apiClient.get<never, JobStatusResponse>(`/jobs/${jobId}`);
}
