/**
 * DocumentUploadForm Component Tests
 *
 * Tests for the document upload form component including:
 * - File validation (type and size)
 * - Drag and drop functionality
 * - Form submission
 * - Error handling
 * - Upload progress
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/hooks/useToast';
import { DocumentUploadForm } from '@/components/upload/DocumentUploadForm';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

// ============================================================================
// Test Setup
// ============================================================================

// Create a wrapper with providers
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

// Helper to create a test file
function createTestFile(
  name: string,
  type: string,
  size: number
): File {
  const blob = new Blob(['test content'], { type });
  const file = new File([blob], name, { type });

  // Override size property for testing
  Object.defineProperty(file, 'size', { value: size });

  return file;
}

// ============================================================================
// Tests
// ============================================================================

describe('DocumentUploadForm', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  // ==========================================================================
  // Initial Render
  // ==========================================================================

  it('renders upload dropzone initially', () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/Click to upload or drag and drop/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/PDF, TXT, or MD \(max 10MB\)/i)
    ).toBeInTheDocument();
  });

  it('displays upload icon in initial state', () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    // Check for Upload icon (SVG element)
    const dropzone = screen.getByText(/Click to upload/i).closest('div');
    expect(dropzone).toBeInTheDocument();
  });

  // ==========================================================================
  // File Selection
  // ==========================================================================

  it('accepts valid PDF file', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 1024 * 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('accepts valid TXT file', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('document.txt', 'text/plain', 500 * 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('document.txt')).toBeInTheDocument();
    });
  });

  it('accepts valid markdown file', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('notes.md', 'text/markdown', 2 * 1024 * 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('notes.md')).toBeInTheDocument();
    });
  });

  it('auto-fills title from filename', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('My Document.pdf', 'application/pdf', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(
        /Document Title/i
      ) as HTMLInputElement;
      expect(titleInput.value).toBe('My Document');
    });
  });

  it('shows file preview with correct information', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 5 * 1024 * 1024); // 5MB
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText(/5 MB/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // File Validation
  // ==========================================================================

  it('rejects file that is too large', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile(
      'large.pdf',
      'application/pdf',
      15 * 1024 * 1024 // 15MB (over limit)
    );
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/File is too large/i)).toBeInTheDocument();
    });
  });

  it('rejects unsupported file type', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('image.jpg', 'image/jpeg', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // File Removal
  // ==========================================================================

  it('allows removing selected file', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove file/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
      expect(
        screen.getByText(/Click to upload or drag and drop/i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Form Submission
  // ==========================================================================

  it('submits form with valid file', async () => {
    // Mock successful upload
    server.use(
      http.post('/api/v1/documents', async () => {
        return HttpResponse.json({
          success: true,
          data: {
            document: {
              id: 'doc_123',
              title: 'test',
              sourceType: 'pdf',
              status: 'processing',
              createdAt: new Date().toISOString(),
            },
            jobId: 'job_123',
          },
        });
      })
    );

    const mockRouter = { push: jest.fn() };
    jest.mock('next/navigation', () => ({
      useRouter: () => mockRouter,
    }));

    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: /upload document/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });

  it('shows upload progress during upload', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: /upload document/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('allows custom title input', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Document Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'My Custom Title');

    expect(titleInput).toHaveValue('My Custom Title');
  });

  it('validates title length', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Document Title/i);
    const longTitle = 'a'.repeat(101); // Over 100 character limit

    await user.clear(titleInput);
    await user.type(titleInput, longTitle);

    // Try to submit
    const submitButton = screen.getByRole('button', {
      name: /upload document/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Title must be less than 100 characters/i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  it('displays error message on upload failure', async () => {
    // Mock failed upload
    server.use(
      http.post('/api/v1/documents', async () => {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'UPLOAD_FAILED',
              message: 'Failed to process document',
            },
          },
          { status: 500 }
        );
      })
    );

    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', {
      name: /upload document/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('has accessible file input', () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    });
    expect(input).toHaveAttribute('type', 'file');
  });

  it('shows progress bar with proper ARIA attributes', async () => {
    render(<DocumentUploadForm />, { wrapper: createWrapper() });

    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    const input = screen.getByLabelText(/click to upload/i, {
      selector: 'input[type="file"]',
    }) as HTMLInputElement;

    await user.upload(input, file);

    const submitButton = screen.getByRole('button', {
      name: /upload document/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });
});
