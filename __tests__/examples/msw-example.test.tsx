/**
 * Example: Using MSW in Component Tests
 *
 * This file demonstrates how to use Mock Service Worker
 * in component tests with React Testing Library.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

// Example component that fetches data
function DocumentViewer({ documentId }: { documentId: string }) {
  const [document, setDocument] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`http://localhost:3000/api/v1/documents/${documentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setDocument(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [documentId]);

  if (loading) return <div role="status">Loading...</div>;
  if (error) return <div role="alert">{error}</div>;
  if (!document) return null;

  return (
    <article>
      <h1>{document.title}</h1>
      <p>{document.contentText}</p>
    </article>
  );
}

import React from 'react';

// Test wrapper with React Query provider
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// MSW server is already set up in jest.setup.ts, so we just need to write tests

describe('MSW Example Tests', () => {
  // ============================================================================
  // Basic Usage: Default Mock Response
  // ============================================================================

  it('should display document data from MSW', async () => {
    render(
      <TestWrapper>
        <DocumentViewer documentId="doc_123" />
      </TestWrapper>
    );

    // Initially shows loading
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');

    // MSW intercepts the request and returns mock data
    await waitFor(() => {
      expect(
        screen.getByText('Active Learning Strategies in Education')
      ).toBeInTheDocument();
    });

    // Mock content is displayed
    expect(screen.getByText(/Active learning is an educational approach/i)).toBeInTheDocument();
  });

  // ============================================================================
  // Override Handler: Custom Response for One Test
  // ============================================================================

  it('should display custom document data', async () => {
    // Override the handler for this test only
    server.use(
      http.get('http://localhost:3000/api/v1/documents/:id', () => {
        return HttpResponse.json({
          success: true,
          data: {
            id: 'doc_custom',
            title: 'Custom Document Title',
            contentText: 'Custom document content for testing.',
            status: 'ready',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: 'test-request-id',
          },
        });
      })
    );

    render(
      <TestWrapper>
        <DocumentViewer documentId="doc_custom" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Document Title')).toBeInTheDocument();
    });

    expect(screen.getByText('Custom document content for testing.')).toBeInTheDocument();
  });

  // ============================================================================
  // Error Scenario: Simulate 404
  // ============================================================================

  it('should display error when document not found', async () => {
    // Use the special 'doc_notfound' ID to trigger 404
    render(
      <TestWrapper>
        <DocumentViewer documentId="doc_notfound" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch');
    });
  });

  // ============================================================================
  // Error Scenario: Custom Error Response
  // ============================================================================

  it('should handle server error', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/documents/:id', () => {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'PROCESSING_FAILED',
              message: 'Document processing failed',
            },
          },
          { status: 500 }
        );
      })
    );

    render(
      <TestWrapper>
        <DocumentViewer documentId="doc_error" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch');
    });
  });

  // ============================================================================
  // Delayed Response: Simulate Slow Network
  // ============================================================================

  it('should show loading state during fetch', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/documents/:id', async () => {
        // Simulate 1 second delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return HttpResponse.json({
          success: true,
          data: {
            id: 'doc_slow',
            title: 'Slow Loading Document',
            contentText: 'Content loaded after delay.',
            status: 'ready',
          },
        });
      })
    );

    render(
      <TestWrapper>
        <DocumentViewer documentId="doc_slow" />
      </TestWrapper>
    );

    // Loading state is shown
    expect(screen.getByRole('status')).toBeInTheDocument();

    // After delay, content appears
    await waitFor(
      () => {
        expect(screen.getByText('Slow Loading Document')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Loading state is gone
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // ============================================================================
  // Multiple Requests: Sequential or Parallel
  // ============================================================================

  it('should handle multiple document fetches', async () => {
    const { rerender } = render(
      <TestWrapper>
        <DocumentViewer documentId="doc_123" />
      </TestWrapper>
    );

    // First document loads
    await waitFor(() => {
      expect(
        screen.getByText('Active Learning Strategies in Education')
      ).toBeInTheDocument();
    });

    // Change documentId to trigger new fetch
    rerender(
      <TestWrapper>
        <DocumentViewer documentId="doc_456" />
      </TestWrapper>
    );

    // Loading state appears again
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Second document loads (MSW returns same mock data with new ID)
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Stateful Behavior: Simulating State Changes
  // ============================================================================

  it('should poll document status until ready', async () => {
    let pollCount = 0;

    server.use(
      http.get('http://localhost:3000/api/v1/documents/:id/status', () => {
        pollCount++;

        // First poll: processing
        if (pollCount === 1) {
          return HttpResponse.json({
            success: true,
            data: {
              id: 'doc_polling',
              status: 'processing',
              progress: 50,
              errorMessage: null,
            },
          });
        }

        // Second poll: ready
        return HttpResponse.json({
          success: true,
          data: {
            id: 'doc_polling',
            status: 'ready',
            progress: 100,
            errorMessage: null,
          },
        });
      })
    );

    // Component that polls status
    function StatusPoller({ documentId }: { documentId: string }) {
      const [status, setStatus] = React.useState<string>('unknown');

      React.useEffect(() => {
        const poll = async () => {
          const res = await fetch(
            `http://localhost:3000/api/v1/documents/${documentId}/status`
          );
          const data = await res.json();
          setStatus(data.data.status);

          if (data.data.status !== 'ready') {
            setTimeout(poll, 500);
          }
        };

        poll();
      }, [documentId]);

      return <div data-testid="status">{status}</div>;
    }

    render(
      <TestWrapper>
        <StatusPoller documentId="doc_polling" />
      </TestWrapper>
    );

    // Initially processing
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('processing');
    });

    // Eventually ready
    await waitFor(
      () => {
        expect(screen.getByTestId('status')).toHaveTextContent('ready');
      },
      { timeout: 2000 }
    );
  });
});

// ============================================================================
// Key Takeaways
// ============================================================================

/*
1. MSW is already configured in jest.setup.ts - no setup needed in tests
2. Default handlers from mocks/handlers.ts are automatically used
3. Use server.use() to override handlers for specific tests
4. Special IDs (doc_notfound, etc.) trigger error scenarios
5. Handlers reset after each test (via afterEach in jest.setup.ts)
6. All requests are mocked - no real network calls
7. You can simulate delays, errors, and state changes
8. Tests run fast and reliably offline
*/
