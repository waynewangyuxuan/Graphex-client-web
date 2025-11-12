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
 * Complete document object
 */
export interface Document {
  id: string;
  title: string;
  contentText: string;
  sourceType: DocumentSourceType;
  sourceUrl?: string;
  fileSize?: number;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Document upload response (after file upload)
 */
export interface DocumentUploadResponse {
  document: {
    id: string;
    title: string;
    sourceType: DocumentSourceType;
    status: DocumentStatus;
    createdAt: string;
  };
  jobId: string;
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
 * Document reference within a node
 */
export interface DocumentReference {
  start: number;
  end: number;
  text: string;
}

/**
 * Graph node
 */
export interface GraphNode {
  id: string;
  nodeKey: string; // Mermaid node key (e.g., "A", "B", "C")
  title: string;
  contentSnippet: string;
  documentRefs: DocumentReference[];
}

/**
 * Graph edge
 */
export interface GraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationship: string;
  aiExplanation: string | null;
}

/**
 * Complete graph object
 */
export interface Graph {
  id: string;
  documentId: string;
  mermaidCode: string;
  status: GraphStatus;
  generationModel: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  createdAt: string;
}

/**
 * Graph generation request
 */
export interface GraphGenerationRequest {
  documentId: string;
}

/**
 * Graph generation response (async job started)
 */
export interface GraphGenerationResponse {
  jobId: string;
  status: JobStatus;
  estimatedTime: string;
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
