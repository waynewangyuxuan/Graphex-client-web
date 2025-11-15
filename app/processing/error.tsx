'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary for Processing Page
 *
 * Catches and handles errors that occur during processing page rendering.
 * Provides user-friendly error messages and recovery options.
 */
export default function ProcessingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (could integrate with error tracking service)
    console.error('Processing page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <Card.Body className="flex flex-col items-center space-y-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
            <AlertCircle className="h-6 w-6 text-error" />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-text-primary">
              Something went wrong
            </h2>
            <p className="text-sm text-text-secondary">
              {error.message || 'An unexpected error occurred while loading the processing page.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={reset}
            >
              Try Again
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Home className="h-4 w-4" />}
              onClick={() => (window.location.href = '/upload')}
            >
              Go Home
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
