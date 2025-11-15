/**
 * Graph React Query Hooks
 *
 * React Query hooks for graph operations:
 * - useGraph: Fetch graph data
 * - useGenerateGraph: Generate graph mutation
 * - useJobStatus: Poll job status for async operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import {
  getGraph,
  generateGraph,
  getJobStatus,
} from '@/lib/api/graphs';
import type {
  Graph,
  GraphGenerationRequest,
  GraphGenerationResponse,
  JobStatusResponse,
} from '@/types/api.types';
import type { NormalizedAPIError } from '@/lib/api-client';

// ============================================================================
// Query Keys
// ============================================================================

/**
 * Query key factory for graph-related queries
 */
export const graphKeys = {
  all: ['graphs'] as const,
  detail: (id: string) => [...graphKeys.all, id] as const,
};

/**
 * Query key factory for job status queries
 */
export const jobKeys = {
  all: ['jobs'] as const,
  status: (id: string) => [...jobKeys.all, id, 'status'] as const,
};

// ============================================================================
// useGraph - Fetch Graph Data
// ============================================================================

/**
 * Fetch graph data with nodes, edges, and Mermaid code
 *
 * @param graphId - Graph ID
 * @param options - React Query options
 * @returns Query result with graph data
 *
 * @example
 * ```typescript
 * const { data: graph, isLoading, error } = useGraph('graph_abc123');
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <MermaidRenderer code={graph.mermaidCode} />
 *     <NodeList nodes={graph.nodes} />
 *   </div>
 * );
 * ```
 */
export function useGraph(
  graphId: string,
  options?: Omit<
    UseQueryOptions<Graph, NormalizedAPIError>,
    'queryKey' | 'queryFn'
  >
) {
  console.log('[useGraph] Called with graphId:', graphId);

  return useQuery<Graph, NormalizedAPIError>({
    queryKey: graphKeys.detail(graphId),
    queryFn: async () => {
      console.log('[useGraph] Fetching graph:', graphId);
      const result = await getGraph(graphId);
      console.log('[useGraph] Received graph:', result?.id);
      return result;
    },
    enabled: !!graphId,
    staleTime: 5 * 60 * 1000, // 5 minutes - graphs don't change after generation
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry 404s
    ...options,
  });
}

// ============================================================================
// useGenerateGraph - Generate Graph Mutation
// ============================================================================

/**
 * Generate graph from document (async operation)
 *
 * Returns a job ID. Use useJobStatus to poll for completion.
 *
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * const [jobId, setJobId] = useState<string | null>(null);
 *
 * const generateMutation = useGenerateGraph({
 *   onSuccess: (data) => {
 *     setJobId(data.jobId);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleGenerate = () => {
 *   generateMutation.mutate({ documentId: 'doc_abc123' });
 * };
 *
 * // Then poll job status
 * const { data: job } = useJobStatus(jobId);
 * ```
 */
export function useGenerateGraph(
  options?: UseMutationOptions<
    GraphGenerationResponse,
    NormalizedAPIError,
    GraphGenerationRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    GraphGenerationResponse,
    NormalizedAPIError,
    GraphGenerationRequest
  >({
    mutationFn: (request) => {
      console.log('[useGenerateGraph] Starting graph generation:', request);
      return generateGraph(request);
    },
    onSuccess: (data) => {
      console.log('[useGenerateGraph] Graph generation completed:', data);
      // Graph generation is synchronous, so we can invalidate graph queries immediately
      if (data.graphId) {
        queryClient.invalidateQueries({ queryKey: graphKeys.detail(data.graphId) });
      }
    },
    onError: (error) => {
      console.error('[useGenerateGraph] Graph generation failed:', error);
    },
    retry: false, // Don't retry graph generation requests
    ...options,
  });
}

// ============================================================================
// useJobStatus - Poll Job Status
// ============================================================================

/**
 * Poll job status for async operations
 *
 * Automatically polls every 2 seconds while job is "queued" or "processing".
 * Stops polling when status is "completed" or "failed".
 *
 * @param jobId - Job ID from async operation
 * @param options - React Query options
 * @returns Query result with job status data
 *
 * @example
 * ```typescript
 * const { data: job } = useJobStatus(jobId);
 *
 * useEffect(() => {
 *   if (job?.status === 'completed' && job.result?.graphId) {
 *     router.push(`/graph/${job.result.graphId}`);
 *   }
 * }, [job]);
 *
 * if (job?.status === 'failed') {
 *   return <ErrorMessage message={job.error} />;
 * }
 *
 * return <ProgressBar progress={job?.progress || 0} />;
 * ```
 */
export function useJobStatus(
  jobId: string | null,
  options?: Omit<
    UseQueryOptions<JobStatusResponse, NormalizedAPIError>,
    'queryKey' | 'queryFn' | 'refetchInterval'
  >
) {
  const queryClient = useQueryClient();

  return useQuery<JobStatusResponse, NormalizedAPIError>({
    queryKey: jobKeys.status(jobId!),
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling if no data yet
      if (!data) return 2000;

      // Stop polling when job is complete or failed
      if (data.status === 'completed' || data.status === 'failed') {
        return false;
      }

      // Continue polling every 2 seconds while queued or processing
      return 2000;
    },
    refetchIntervalInBackground: false, // Pause polling when tab is inactive
    staleTime: 0, // Always fetch fresh data
    cacheTime: 1000, // Keep in cache briefly
    retry: false, // Don't retry status checks
    onSuccess: (data) => {
      // When job completes successfully, prefetch the graph
      if (data.status === 'completed' && data.result?.graphId) {
        queryClient.prefetchQuery({
          queryKey: graphKeys.detail(data.result.graphId),
          queryFn: () => getGraph(data.result!.graphId!),
        });
      }
    },
    ...options,
  });
}

// ============================================================================
// Composite Hook: useGraphGeneration
// ============================================================================

/**
 * Combined hook for graph generation workflow
 *
 * Handles both graph generation mutation and job status polling.
 *
 * @returns Combined mutation and status query
 *
 * @example
 * ```typescript
 * const { generateGraph, job, isGenerating, isPolling } = useGraphGeneration();
 *
 * const handleGenerate = () => {
 *   generateGraph({ documentId: 'doc_abc123' });
 * };
 *
 * useEffect(() => {
 *   if (job?.status === 'completed' && job.result?.graphId) {
 *     router.push(`/graph/${job.result.graphId}`);
 *   }
 * }, [job]);
 *
 * return (
 *   <div>
 *     <button onClick={handleGenerate} disabled={isGenerating}>
 *       Generate Graph
 *     </button>
 *     {isPolling && <ProgressBar progress={job?.progress || 0} />}
 *   </div>
 * );
 * ```
 */
export function useGraphGeneration() {
  const [jobId, setJobId] = React.useState<string | null>(null);

  const generateMutation = useGenerateGraph({
    onSuccess: (data) => {
      setJobId(data.jobId);
    },
  });

  const jobQuery = useJobStatus(jobId);

  return {
    // Mutation
    generateGraph: generateMutation.mutate,
    generateGraphAsync: generateMutation.mutateAsync,
    isGenerating: generateMutation.isLoading,
    generateError: generateMutation.error,

    // Job status
    job: jobQuery.data,
    isPolling: jobQuery.isFetching,
    jobError: jobQuery.error,

    // Combined states
    isLoading: generateMutation.isLoading || jobQuery.isFetching,
    error: generateMutation.error || jobQuery.error,
  };
}

// Need React import for useState
import React from 'react';
