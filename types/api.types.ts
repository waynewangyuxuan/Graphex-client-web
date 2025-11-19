/**
 * API Type Definitions
 *
 * Type definitions for all API requests and responses based on the
 * standardized API response format from Server_API_Reference.md
 */

// ============================================================================
// Base API Response Types
// ============================================================================

/**
 * Standardized success response wrapper
 */
export interface APISuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * Standardized error response wrapper
 */
export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * Union type for all API responses
 */
export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse;

/**
 * Known error codes from the API
 */
export enum APIErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  GRAPH_NOT_FOUND = 'GRAPH_NOT_FOUND',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// ============================================================================
// Document Types
// ============================================================================

/**
 * Document source types
 */
export type DocumentSourceType = 'pdf' | 'text' | 'markdown' | 'url';

/**
 * Document processing status
 */
export type DocumentStatus = 'processing' | 'ready' | 'failed';

/**
 * Text block with bounding box coordinates (for PDF documents)
 */
export interface TextBlock {
  text: string;
  page: number; // 0-indexed page number
  bbox: {
    x: number; // PDF coordinate (points from left)
    y: number; // PDF coordinate (points from bottom)
    width: number;
    height: number;
  };
}

/**
 * Complete document object
 * Matches backend GET /api/v1/documents/:id response
 */
export interface Document {
  id: string;
  title: string;
  content: string; // Full extracted text from PDF/document
  sourceType: DocumentSourceType;
  status: DocumentStatus;
  metadata: {
    fileSize: number;
    quality: {
      score: number;
    };
    images?: unknown[];
    textBlocks?: TextBlock[]; // PDF text blocks with coordinates
    pageCount?: number; // Number of pages (for PDFs)
    wordCount?: number; // Total word count
  };
}

/**
 * Document upload response (after file upload)
 * Matches ACTUAL backend POST /api/v1/documents response
 */
export interface DocumentUploadResponse {
  id: string; // Document ID
  title: string;
  sourceType: string; // 'pdf', 'text', 'markdown', 'url'
  status: string; // 'ready', 'processing', 'failed'
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Document from URL request
 */
export interface DocumentFromUrlRequest {
  url: string;
  title?: string;
}

/**
 * Document status response (for polling)
 */
export interface DocumentStatusResponse {
  id: string;
  status: DocumentStatus;
  progress: number; // 0-100
  errorMessage: string | null;
}

// ============================================================================
// Graph Types
// ============================================================================

/**
 * Graph processing status
 */
export type GraphStatus = 'ready' | 'processing' | 'failed';

/**
 * Document reference within a node (source reference) - LEGACY
 * Character-based references (backward compatible)
 */
export interface DocumentReference {
  start: number; // Character position in document.content
  end: number; // Character position in document.content
  text: string; // Actual text snippet
}

/**
 * Bounding box coordinates in PDF coordinate system
 * (origin at bottom-left, Y increases upward)
 */
export interface BoundingBox {
  x: number; // PDF coordinate (points from left)
  y: number; // PDF coordinate (points from bottom)
  width: number;
  height: number;
}

/**
 * Coordinate-based document reference (NEW - for precise PDF highlighting)
 * Uses discriminated union for type safety between single-page and cross-page references
 */
export type NodeDocumentReference =
  | {
      // Single-page reference (most common)
      text: string;
      page: number; // 0-indexed page number
      coordinates: BoundingBox;
    }
  | {
      // Cross-page reference (for text spanning multiple pages)
      text: string;
      pages: number[]; // Array of page numbers
      coordinates: Array<{
        page: number;
        bbox: BoundingBox;
      }>;
    };

/**
 * Document references container for graph nodes
 */
export interface NodeDocumentRefs {
  references: NodeDocumentReference[];
}

/**
 * Graph node
 * Matches backend node structure in GET /api/v1/graphs/:id from FRONTEND_INTEGRATION.md
 */
export interface GraphNode {
  id: string;
  nodeKey: string; // Mermaid node key (e.g., "0_A", "0_B")
  title: string;
  contentSnippet: string; // Brief content preview
  nodeType: string; // e.g., "method", "concept"
  summary: string; // 2-sentence summary
  documentRefs: NodeDocumentRefs | null; // Coordinate-based references (NEW)
  legacyDocumentRefs?: DocumentReference[] | null; // Legacy character-based refs (backward compat)
  position: { x: number | null; y: number | null }; // Visual position
  metadata: Record<string, unknown> | null; // Additional metadata
}

/**
 * Graph edge
 * Matches backend edge structure in GET /api/v1/graphs/:id from FRONTEND_INTEGRATION.md
 */
export interface GraphEdge {
  id: string;
  from: string; // ID of source node
  to: string; // ID of target node
  fromNode: {
    nodeKey: string;
    title: string;
  };
  toNode: {
    nodeKey: string;
    title: string;
  };
  relationship: string;
  aiExplanation: string | null;
  strength: number | null; // Connection strength
  metadata: Record<string, unknown> | null; // Additional metadata
}

/**
 * Complete graph object
 * Matches backend GET /api/v1/graphs/:id response from FRONTEND_INTEGRATION.md
 */
export interface Graph {
  id: string;
  status: 'ready' | 'processing' | 'failed';
  mermaidCode: string;
  generationModel: string; // e.g., "claude-sonnet-4"
  version: number;
  createdAt: string;
  document: {
    id: string;
    title: string;
    sourceType: string;
    createdAt: string;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Graph generation request
 * Supports both document ID and direct text
 */
export interface GraphGenerationRequest {
  documentId?: string; // Mode A: From uploaded document
  documentText?: string; // Mode B: Direct text (backward compatible)
  documentTitle?: string; // Optional for Mode B
}

/**
 * Graph generation response (synchronous in real backend)
 * Matches backend POST /api/v1/graphs/generate response from FRONTEND_INTEGRATION.md
 */
export interface GraphGenerationResponse {
  graphId: string;
  status: 'completed' | 'failed';
  nodeCount: number;
  edgeCount: number;
  qualityScore: number;
  cost: number;
  processingTimeMs: number;
  warnings: string[];
}

// ============================================================================
// Job Status Types
// ============================================================================

/**
 * Job status for async operations
 */
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

/**
 * Job type
 */
export type JobType = 'document-processing' | 'graph-generation';

/**
 * Job status response (for polling)
 */
export interface JobStatusResponse {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0-100
  result: {
    graphId?: string;
    documentId?: string;
    [key: string]: unknown;
  } | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

// ============================================================================
// Connection Types
// ============================================================================

/**
 * Hypothesis evaluation match level
 */
export type HypothesisMatch = 'full' | 'partial' | 'incorrect';

/**
 * User hypothesis evaluation
 */
export interface HypothesisEvaluation {
  match: HypothesisMatch;
  feedback: string;
}

/**
 * Connection explanation request
 */
export interface ConnectionExplanationRequest {
  fromNodeId: string;
  toNodeId: string;
  userHypothesis?: string;
}

/**
 * Connection explanation response
 */
export interface ConnectionExplanationResponse {
  fromNode: string;
  toNode: string;
  relationship: string;
  explanation: string;
  sourceReferences: DocumentReference[];
  userHypothesisEvaluation?: HypothesisEvaluation;
}

// ============================================================================
// Quiz Types
// ============================================================================

/**
 * Quiz difficulty levels
 */
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Quiz question option
 */
export interface QuizOption {
  id: number;
  text: string;
}

/**
 * Quiz question
 */
export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctAnswer: number;
  explanation: string;
  difficulty: QuizDifficulty;
  nodeRefs: string[];
}

/**
 * Quiz generation request
 */
export interface QuizGenerationRequest {
  graphId: string;
  difficulty?: QuizDifficulty;
  count?: number;
}

/**
 * Quiz generation response
 */
export interface QuizGenerationResponse {
  quizId: string;
  questions: QuizQuestion[];
}

/**
 * Quiz answer submission
 */
export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
}

/**
 * Quiz submission request
 */
export interface QuizSubmissionRequest {
  answers: QuizAnswer[];
}

/**
 * Individual question result
 */
export interface QuizQuestionResult {
  questionId: string;
  correct: boolean;
  selectedAnswer: number;
  correctAnswer: number;
  explanation: string;
}

/**
 * Quiz submission response
 */
export interface QuizSubmissionResponse {
  score: number; // percentage
  correct: number;
  total: number;
  results: QuizQuestionResult[];
}

// ============================================================================
// Note Types
// ============================================================================

/**
 * Note object
 */
export interface Note {
  id: string;
  graphId: string;
  nodeId: string | null;
  edgeId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Note creation request
 */
export interface NoteCreateRequest {
  graphId: string;
  nodeId?: string;
  edgeId?: string;
  content: string;
}

/**
 * Note update request
 */
export interface NoteUpdateRequest {
  content: string;
}

// ============================================================================
// Health Check Types
// ============================================================================

/**
 * Basic health check response
 */
export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
}

/**
 * Service checks
 */
export interface ServiceChecks {
  database: 'ok' | 'error';
  redis: 'ok' | 'error';
  anthropic?: 'ok' | 'error';
  openai?: 'ok' | 'error';
}

/**
 * Readiness check response
 */
export interface ReadinessCheckResponse {
  status: 'ready' | 'not_ready';
  checks: Pick<ServiceChecks, 'database' | 'redis'>;
}

/**
 * Deep health check response
 */
export interface DeepHealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: ServiceChecks;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

/**
 * Rate limit headers (from response)
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

// ============================================================================
// Upload Types
// ============================================================================

/**
 * File upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload configuration
 */
export interface UploadConfig {
  onUploadProgress?: UploadProgressCallback;
}
