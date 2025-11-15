'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDocumentStatus } from '@/hooks/useDocument';
import { useGenerateGraph } from '@/hooks/useGraph';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { FileText, AlertCircle, ArrowLeft } from 'lucide-react';

/**
 * Document Processing & Graph Generation Page
 *
 * Route: /processing?docId={documentId}
 *
 * Workflow:
 * 1. Wait for document to be ready
 * 2. Trigger graph generation
 * 3. Show progress while generating (20-30 seconds)
 * 4. Redirect to /graph/{graphId} when complete
 *
 * Server/Client Boundary:
 * - Client Component (needs useSearchParams, useRouter, React Query)
 * - No initial server-side data fetching needed
 */
export default function ProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get('docId');

  // Track if we've started generation
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  // Poll document status (automatically polls every 2s while processing)
  const { data: status, error: docError, isError: isDocError, isLoading } = useDocumentStatus(docId || '', {
    enabled: !!docId,
  });

  // Graph generation mutation
  const generateGraph = useGenerateGraph({
    onSuccess: (data) => {
      console.log('[Processing] Graph generated:', data.graphId);
      // Redirect to graph page with the graph ID
      router.push(`/graph/${data.graphId}`);
    },
    onError: (error) => {
      console.error('[Processing] Graph generation failed:', error);
    },
  });

  // Trigger graph generation when document is ready
  useEffect(() => {
    if (status?.status === 'ready' && docId && !hasStartedGeneration && !generateGraph.isPending) {
      console.log('[Processing] Document ready, starting graph generation');
      setHasStartedGeneration(true);
      generateGraph.mutate({ documentId: docId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.status, docId, hasStartedGeneration, generateGraph.isPending]);

  // Get status message based on progress
  const getStatusMessage = (progress: number): string => {
    if (progress < 20) return 'Starting document analysis...';
    if (progress < 40) return 'Extracting content...';
    if (progress < 60) return 'Processing document structure...';
    if (progress < 80) return 'Analyzing concepts...';
    if (progress < 95) return 'Generating knowledge graph...';
    return 'Finalizing...';
  };

  // Handle missing docId
  if (!docId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <Card.Body className="flex flex-col items-center space-y-4 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-text-primary">
                Missing Document ID
              </h2>
              <p className="text-sm text-text-secondary">
                No document ID was provided. Please upload a document to continue.
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/upload')}
            >
              Return to Upload
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Handle errors (document or graph generation)
  const error = docError || generateGraph.error;
  const isError = isDocError || generateGraph.isError;

  if (isError && error) {
    const errorMessage =
      error?.code === 'DOCUMENT_NOT_FOUND'
        ? 'This document could not be found. It may have been deleted or the link is invalid.'
        : error?.message || 'An unexpected error occurred.';

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <Card.Body className="flex flex-col items-center space-y-4 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-text-primary">
                Document Not Found
              </h2>
              <p className="text-sm text-text-secondary">{errorMessage}</p>
            </div>
            <Button
              variant="primary"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/upload')}
            >
              Return to Upload
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Handle processing failed state
  if (status?.status === 'failed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <Card.Body className="flex flex-col items-center space-y-4 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-text-primary">
                Processing Failed
              </h2>
              <p className="text-sm text-text-secondary">
                {status.errorMessage ||
                  'We encountered an error while processing your document. Please try uploading it again.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => router.push('/upload')}
              >
                Upload Another
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Initial loading state (before first status check)
  if (isLoading || !status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <Card.Body className="flex flex-col items-center space-y-6 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Spinner size="lg" variant="primary" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-text-primary">
                Checking document status...
              </h2>
              <p className="text-sm text-text-secondary">Please wait a moment</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Determine current stage and progress
  const isGeneratingGraph = hasStartedGeneration && generateGraph.isPending;
  const documentProgress = status.progress || 0;

  // Show 0-50% for document processing, 50-100% for graph generation
  const progress = isGeneratingGraph ? 75 : Math.min(documentProgress, 50);
  const statusMessage = isGeneratingGraph
    ? 'Generating knowledge graph...'
    : getStatusMessage(documentProgress);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <Card.Body className="space-y-8 p-8">
          {/* Header with icon */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo.png"
              alt="Graphex Logo"
              className="w-16 h-16 object-contain mb-4"
            />
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              {isGeneratingGraph ? 'Generating Your Knowledge Graph' : 'Processing Your Document'}
            </h1>
            <p className="text-sm text-text-secondary">
              {isGeneratingGraph
                ? 'This usually takes 20-30 seconds. Creating nodes, edges, and relationships.'
                : 'Extracting and analyzing your document content.'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress
              value={progress}
              label={statusMessage}
              showPercentage
              variant="primary"
            />
          </div>

          {/* Status indicators */}
          <div className="rounded-lg bg-primary-50 p-4">
            <div className="flex items-start gap-3">
              <Spinner size="sm" variant="primary" className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {statusMessage}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {isGeneratingGraph
                    ? 'Analyzing concepts and building graph structure'
                    : 'Preparing document for graph generation'}
                </p>
              </div>
            </div>
          </div>

          {/* Optional: Cancel action (MVP - just return to upload) */}
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/upload')}
            >
              Cancel and Return
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
