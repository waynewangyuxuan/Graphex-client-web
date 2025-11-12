/**
 * Error Boundary for Graph View Page
 *
 * Catches errors that occur during graph rendering and provides
 * user-friendly error messages with recovery options.
 */

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Graph view error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="text-center max-w-md px-4">
        {/* Error icon */}
        <svg
          className="w-16 h-16 text-error mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Error message */}
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-text-secondary mb-6">
          {error.message || 'An unexpected error occurred while loading the graph.'}
        </p>

        {/* Error digest (for support) */}
        {error.digest && (
          <p className="text-xs text-text-muted mb-4">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {/* Try again button */}
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Try Again
          </button>

          {/* Go home button */}
          <a
            href="/"
            className="px-6 py-2.5 bg-gray-200 text-text-primary rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </a>
        </div>

        {/* Help text */}
        <p className="text-sm text-text-muted mt-6">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
