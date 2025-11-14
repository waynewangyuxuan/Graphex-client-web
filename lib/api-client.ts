/**
 * API Client Configuration
 *
 * Axios client with request/response interceptors for standardized
 * API communication, error handling, and retry logic.
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { APIErrorResponse, APISuccessResponse } from '@/types/api.types';

// ============================================================================
// Configuration
// ============================================================================

/**
 * API base URL from environment variable
 * Default to backend running on port 4000
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Default request timeout (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Extended timeout for file uploads (5 minutes)
 */
export const UPLOAD_TIMEOUT = 300000;

// ============================================================================
// Axios Instance
// ============================================================================

/**
 * Configured Axios instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Request Interceptor
// ============================================================================

/**
 * Add request ID and logging for all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Generate unique request ID for tracing
    const requestId = crypto.randomUUID();
    config.headers['X-Request-ID'] = requestId;

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        requestId,
        timestamp: new Date().toISOString(),
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor
// ============================================================================

/**
 * Extract data from standardized response format and handle errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<APISuccessResponse<unknown>>) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Response]', {
        url: response.config.url,
        status: response.status,
        requestId: response.config.headers['X-Request-ID'],
        timestamp: new Date().toISOString(),
      });
    }

    // Extract data directly from standardized response format
    // This allows React Query hooks to work with data directly
    if (response.data && response.data.success === true) {
      return response.data.data as any;
    }

    // Return full response if not in standard format (edge case)
    return response;
  },
  async (error: AxiosError<APIErrorResponse>) => {
    // Handle 429 Rate Limit with exponential backoff
    if (error.response?.status === 429 && !error.config?._retry) {
      const config = error.config as AxiosRequestConfig & { _retry?: boolean };
      config._retry = true;

      // Get retry-after from headers or error details
      const retryAfter =
        error.response.headers['retry-after'] ||
        error.response.data?.error?.details?.retryAfter ||
        2;

      const retryDelayMs =
        typeof retryAfter === 'string'
          ? parseInt(retryAfter, 10) * 1000
          : retryAfter * 1000;

      // Log rate limit in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[API Rate Limited] Retrying after ${retryDelayMs}ms`,
          config.url
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));

      // Retry the request
      return apiClient(config);
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        code: error.response?.data?.error?.code,
        message: error.response?.data?.error?.message,
        requestId: error.config?.headers?.['X-Request-ID'],
        timestamp: new Date().toISOString(),
      });
    }

    // Normalize error for consistent handling
    return Promise.reject(normalizeError(error));
  }
);

// ============================================================================
// Error Normalization
// ============================================================================

/**
 * Normalized error structure for consistent error handling
 */
export interface NormalizedAPIError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
  originalError: AxiosError;
}

/**
 * Normalize Axios errors into consistent format
 */
export function normalizeError(error: AxiosError<APIErrorResponse>): NormalizedAPIError {
  // API error response (standardized format)
  if (error.response?.data?.error) {
    return {
      code: error.response.data.error.code,
      message: error.response.data.error.message,
      status: error.response.status,
      details: error.response.data.error.details,
      originalError: error,
    };
  }

  // Network error (no response)
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please check your internet connection.',
      status: 0,
      originalError: error,
    };
  }

  // HTTP error without API error format
  const status = error.response.status;
  let message = 'An unexpected error occurred';

  switch (status) {
    case 400:
      message = 'Invalid request. Please check your input.';
      break;
    case 401:
      message = 'Authentication required. Please log in.';
      break;
    case 403:
      message = 'You do not have permission to perform this action.';
      break;
    case 404:
      message = 'The requested resource was not found.';
      break;
    case 429:
      message = 'Too many requests. Please try again later.';
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = 'Server error. Please try again later.';
      break;
  }

  return {
    code: `HTTP_${status}`,
    message,
    status,
    originalError: error,
  };
}

// ============================================================================
// Retry Configuration
// ============================================================================

/**
 * Determine if an error should be retried
 */
export function shouldRetry(error: NormalizedAPIError): boolean {
  // Don't retry client errors (4xx except 429)
  if (error.status >= 400 && error.status < 500 && error.status !== 429) {
    return false;
  }

  // Retry server errors (5xx)
  if (error.status >= 500) {
    return true;
  }

  // Retry network errors
  if (error.status === 0) {
    return true;
  }

  return false;
}

/**
 * Calculate retry delay with exponential backoff and jitter
 *
 * Formula: min(baseDelay * 2^attempt + jitter, maxDelay)
 */
export function getRetryDelay(attemptIndex: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 16000; // 16 seconds
  const jitterPercent = 0.2; // ±20% jitter

  // Calculate exponential backoff: 1s, 2s, 4s, 8s, 16s
  const exponentialDelay = Math.min(
    baseDelay * Math.pow(2, attemptIndex),
    maxDelay
  );

  // Add random jitter to avoid thundering herd
  const jitter = exponentialDelay * jitterPercent * (Math.random() * 2 - 1);

  return Math.round(exponentialDelay + jitter);
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

/**
 * Get user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: NormalizedAPIError): string {
  // Use API error message if available
  if (error.message) {
    return error.message;
  }

  // Fallback messages based on status
  switch (error.status) {
    case 0:
      return 'Unable to connect. Please check your internet connection.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. Please try again in a few moments.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// ============================================================================
// Rate Limit Helpers
// ============================================================================

/**
 * Extract rate limit information from response headers
 */
export function getRateLimitInfo(
  response: AxiosResponse
): {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
} {
  const headers = response.headers;

  return {
    limit: headers['x-ratelimit-limit']
      ? parseInt(headers['x-ratelimit-limit'], 10)
      : null,
    remaining: headers['x-ratelimit-remaining']
      ? parseInt(headers['x-ratelimit-remaining'], 10)
      : null,
    reset: headers['x-ratelimit-reset']
      ? parseInt(headers['x-ratelimit-reset'], 10)
      : null,
  };
}

// ============================================================================
// Export
// ============================================================================

export default apiClient;
