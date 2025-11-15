/**
 * Document API Functions
 *
 * API functions for document upload, retrieval, and status checking.
 */

import apiClient, { UPLOAD_TIMEOUT } from '@/lib/api-client';
import type {
  Document,
  DocumentUploadResponse,
  DocumentFromUrlRequest,
  DocumentStatusResponse,
  UploadConfig,
} from '@/types/api.types';

// ============================================================================
// Document Upload
// ============================================================================

/**
 * Upload a document file (PDF, text, or markdown)
 *
 * @param file - File to upload
 * @param title - Optional document title
 * @param config - Upload configuration (progress tracking)
 * @returns Document upload response with document ID and job ID
 *
 * @example
 * ```typescript
 * const response = await uploadDocument(file, 'My Document', {
 *   onUploadProgress: (progress) => console.log(`${progress}%`)
 * });
 * console.log(response.id); // "doc_abc123"
 * ```
 */
export async function uploadDocument(
  file: File,
  title?: string,
  config?: UploadConfig
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (title) {
    formData.append('title', title);
  }

  return apiClient.post<never, DocumentUploadResponse>('/documents', formData, {
    timeout: UPLOAD_TIMEOUT,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (config?.onUploadProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        config.onUploadProgress(progress);
      }
    },
  });
}

// ============================================================================
// Document from URL
// ============================================================================

/**
 * Extract content from a URL
 *
 * @param request - URL and optional title
 * @returns Document upload response with document ID and job ID
 *
 * @example
 * ```typescript
 * const response = await uploadDocumentFromUrl({
 *   url: 'https://example.com/article',
 *   title: 'Article Title'
 * });
 * ```
 */
export async function uploadDocumentFromUrl(
  request: DocumentFromUrlRequest
): Promise<DocumentUploadResponse> {
  return apiClient.post<DocumentFromUrlRequest, DocumentUploadResponse>(
    '/documents/from-url',
    request
  );
}

// ============================================================================
// Get Document
// ============================================================================

/**
 * Get complete document details
 *
 * @param documentId - Document ID
 * @returns Complete document object with content
 *
 * @example
 * ```typescript
 * const document = await getDocument('doc_abc123');
 * console.log(document.contentText);
 * ```
 */
export async function getDocument(documentId: string): Promise<Document> {
  return apiClient.get<never, Document>(`/documents/${documentId}`);
}

// ============================================================================
// Get Document Status
// ============================================================================

/**
 * Check document processing status (for polling)
 *
 * Use this endpoint to poll for document processing completion.
 * Poll every 2 seconds while status is "processing".
 *
 * @param documentId - Document ID
 * @returns Document status with progress
 *
 * @example
 * ```typescript
 * const status = await getDocumentStatus('doc_abc123');
 * if (status.status === 'ready') {
 *   // Document is ready
 * }
 * ```
 */
export async function getDocumentStatus(
  documentId: string
): Promise<DocumentStatusResponse> {
  return apiClient.get<never, DocumentStatusResponse>(
    `/documents/${documentId}/status`
  );
}
