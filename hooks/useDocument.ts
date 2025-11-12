/**
 * Document React Query Hooks
 *
 * React Query hooks for document operations:
 * - useDocument: Fetch document details
 * - useDocumentStatus: Poll document processing status
 * - useUploadDocument: Upload document file mutation
 * - useUploadDocumentFromUrl: Upload from URL mutation
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import {
  getDocument,
  getDocumentStatus,
  uploadDocument,
  uploadDocumentFromUrl,
} from '@/lib/api/documents';
import type {
  Document,
  DocumentStatusResponse,
  DocumentUploadResponse,
  DocumentFromUrlRequest,
  UploadConfig,
} from '@/types/api.types';
import type { NormalizedAPIError } from '@/lib/api-client';

// ============================================================================
// Query Keys
// ============================================================================

/**
 * Query key factory for document-related queries
 */
export const documentKeys = {
  all: ['documents'] as const,
  detail: (id: string) => [...documentKeys.all, id] as const,
  status: (id: string) => [...documentKeys.all, id, 'status'] as const,
};

// ============================================================================
// useDocument - Fetch Document Details
// ============================================================================

/**
 * Fetch complete document details
 *
 * @param documentId - Document ID
 * @param options - React Query options
 * @returns Query result with document data
 *
 * @example
 * ```typescript
 * const { data: document, isLoading, error } = useDocument('doc_abc123');
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <div>{document.contentText}</div>;
 * ```
 */
export function useDocument(
  documentId: string,
  options?: Omit<
    UseQueryOptions<Document, NormalizedAPIError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Document, NormalizedAPIError>({
    queryKey: documentKeys.detail(documentId),
    queryFn: () => getDocument(documentId),
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes - documents don't change often
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry 404s
    ...options,
  });
}

// ============================================================================
// useDocumentStatus - Poll Document Processing Status
// ============================================================================

/**
 * Poll document processing status
 *
 * Automatically polls every 2 seconds while status is "processing".
 * Stops polling when status is "ready" or "failed".
 *
 * @param documentId - Document ID
 * @param options - React Query options
 * @returns Query result with status data
 *
 * @example
 * ```typescript
 * const { data: status } = useDocumentStatus('doc_abc123');
 *
 * useEffect(() => {
 *   if (status?.status === 'ready') {
 *     router.push(`/graph/${status.graphId}`);
 *   }
 * }, [status]);
 *
 * return <ProgressBar progress={status?.progress || 0} />;
 * ```
 */
export function useDocumentStatus(
  documentId: string,
  options?: Omit<
    UseQueryOptions<DocumentStatusResponse, NormalizedAPIError>,
    'queryKey' | 'queryFn' | 'refetchInterval'
  >
) {
  return useQuery<DocumentStatusResponse, NormalizedAPIError>({
    queryKey: documentKeys.status(documentId),
    queryFn: () => getDocumentStatus(documentId),
    enabled: !!documentId,
    refetchInterval: (data) => {
      // Stop polling if no data yet
      if (!data) return 2000;

      // Stop polling when processing is complete
      if (data.status === 'ready' || data.status === 'failed') {
        return false;
      }

      // Continue polling every 2 seconds while processing
      return 2000;
    },
    refetchIntervalInBackground: false, // Pause polling when tab is inactive
    staleTime: 0, // Always fetch fresh data
    cacheTime: 1000, // Keep in cache briefly
    retry: false, // Don't retry status checks
    ...options,
  });
}

// ============================================================================
// useUploadDocument - Upload Document File Mutation
// ============================================================================

/**
 * Upload document file mutation
 *
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * const [uploadProgress, setUploadProgress] = useState(0);
 * const uploadMutation = useUploadDocument({
 *   onSuccess: (data) => {
 *     router.push(`/processing?docId=${data.document.id}`);
 *   }
 * });
 *
 * const handleUpload = (file: File) => {
 *   uploadMutation.mutate(
 *     { file, title: 'My Document' },
 *     {
 *       onUploadProgress: (progress) => setUploadProgress(progress)
 *     }
 *   );
 * };
 *
 * return (
 *   <div>
 *     <button onClick={() => handleUpload(selectedFile)}>Upload</button>
 *     {uploadMutation.isLoading && <ProgressBar progress={uploadProgress} />}
 *   </div>
 * );
 * ```
 */
export function useUploadDocument(
  options?: UseMutationOptions<
    DocumentUploadResponse,
    NormalizedAPIError,
    { file: File; title?: string; config?: UploadConfig }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    DocumentUploadResponse,
    NormalizedAPIError,
    { file: File; title?: string; config?: UploadConfig }
  >({
    mutationFn: ({ file, title, config }) => uploadDocument(file, title, config),
    onSuccess: (data) => {
      // Optimistically set initial document status
      queryClient.setQueryData(
        documentKeys.status(data.document.id),
        {
          id: data.document.id,
          status: 'processing',
          progress: 0,
          errorMessage: null,
        } as DocumentStatusResponse
      );
    },
    retry: false, // Don't retry uploads
    ...options,
  });
}

// ============================================================================
// useUploadDocumentFromUrl - Upload from URL Mutation
// ============================================================================

/**
 * Upload document from URL mutation
 *
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * const uploadFromUrlMutation = useUploadDocumentFromUrl({
 *   onSuccess: (data) => {
 *     router.push(`/processing?docId=${data.document.id}`);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleSubmit = (url: string) => {
 *   uploadFromUrlMutation.mutate({ url, title: 'Article' });
 * };
 * ```
 */
export function useUploadDocumentFromUrl(
  options?: UseMutationOptions<
    DocumentUploadResponse,
    NormalizedAPIError,
    DocumentFromUrlRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    DocumentUploadResponse,
    NormalizedAPIError,
    DocumentFromUrlRequest
  >({
    mutationFn: (request) => uploadDocumentFromUrl(request),
    onSuccess: (data) => {
      // Optimistically set initial document status
      queryClient.setQueryData(
        documentKeys.status(data.document.id),
        {
          id: data.document.id,
          status: 'processing',
          progress: 0,
          errorMessage: null,
        } as DocumentStatusResponse
      );
    },
    retry: false, // Don't retry uploads
    ...options,
  });
}
