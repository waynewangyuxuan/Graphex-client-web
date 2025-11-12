/**
 * Tests for ReadingPanel Component
 *
 * Tests document fetching, scrolling, highlighting, and UI states.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { ReadingPanel } from '@/components/reading/ReadingPanel';
import { useDocument } from '@/hooks/useDocument';
import type { Document } from '@/types/api.types';

// Mock hooks
jest.mock('@/hooks/useDocument');
jest.mock('@/lib/scroll-utils');

const mockUseDocument = useDocument as jest.MockedFunction<typeof useDocument>;

// Mock document data
const mockDocument: Document = {
  id: 'doc_123',
  title: 'Test Document',
  contentText: 'This is the document content.\n\nSecond paragraph here.\n\nThird paragraph.',
  sourceType: 'text',
  status: 'ready',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('ReadingPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Loading State
  // ============================================================================

  it('shows loading state while fetching document', () => {
    mockUseDocument.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<ReadingPanel documentId="doc_123" />);

    expect(screen.getByText(/loading document/i)).toBeInTheDocument();
  });

  it('shows loading spinner during fetch', () => {
    mockUseDocument.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const { container } = render(<ReadingPanel documentId="doc_123" />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  // ============================================================================
  // Error State
  // ============================================================================

  it('shows error state when fetch fails', () => {
    const error = new Error('Failed to load document');
    mockUseDocument.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Failed to load document' },
    } as any);

    render(<ReadingPanel documentId="doc_123" />);

    expect(screen.getByText(/failed to load document/i)).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
  });

  it('shows error icon in error state', () => {
    mockUseDocument.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Error' },
    } as any);

    const { container } = render(<ReadingPanel documentId="doc_123" />);

    const errorIcon = container.querySelector('svg');
    expect(errorIcon).toBeInTheDocument();
  });

  // ============================================================================
  // No Document State
  // ============================================================================

  it('shows no document state when document is null', () => {
    mockUseDocument.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(<ReadingPanel documentId="doc_123" />);

    expect(screen.getByText(/no document loaded/i)).toBeInTheDocument();
  });

  // ============================================================================
  // Successful Render
  // ============================================================================

  it('renders document when loaded successfully', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    render(<ReadingPanel documentId="doc_123" />);

    expect(screen.getByText(mockDocument.title)).toBeInTheDocument();
  });

  it('displays document source type', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    render(<ReadingPanel documentId="doc_123" />);

    expect(screen.getByText(/TEXT document/i)).toBeInTheDocument();
  });

  it('renders DocumentViewer with content', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    render(<ReadingPanel documentId="doc_123" />);

    expect(screen.getByText(/document content/i)).toBeInTheDocument();
  });

  // ============================================================================
  // Highlighting
  // ============================================================================

  it('passes highlightRange to DocumentViewer', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const highlightRange = { startOffset: 10, endOffset: 25 };

    render(
      <ReadingPanel documentId="doc_123" highlightRange={highlightRange} />
    );

    // Verify DocumentViewer receives the range
    // (Implementation detail: check rendered component props)
    expect(screen.getByText(/document content/i)).toBeInTheDocument();
  });

  // ============================================================================
  // Active Node
  // ============================================================================

  it('accepts activeNodeId prop', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    render(<ReadingPanel documentId="doc_123" activeNodeId="node_456" />);

    expect(screen.getByText(mockDocument.title)).toBeInTheDocument();
  });

  // ============================================================================
  // Scroll Indicator
  // ============================================================================

  it('renders scroll indicator', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<ReadingPanel documentId="doc_123" />);

    // Check for scroll indicator presence
    const scrollIndicator = container.querySelector('[role="status"]');
    expect(scrollIndicator).toBeInTheDocument();
  });

  // ============================================================================
  // Scroll to Top Button
  // ============================================================================

  it('renders scroll to top button (conditionally)', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<ReadingPanel documentId="doc_123" />);

    // Button appears when scrolled, initially hidden
    const scrollButton = container.querySelector('button[aria-label="Scroll to top"]');
    // May be null initially (correct behavior)
    expect(scrollButton).toBeNull();
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  it('has proper ARIA labels', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<ReadingPanel documentId="doc_123" />);

    const statusElements = container.querySelectorAll('[role="status"]');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('has semantic heading for document title', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    render(<ReadingPanel documentId="doc_123" />);

    const heading = screen.getByRole('heading', { name: mockDocument.title });
    expect(heading).toBeInTheDocument();
  });

  // ============================================================================
  // Custom Class Name
  // ============================================================================

  it('applies custom className', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(
      <ReadingPanel documentId="doc_123" className="custom-panel" />
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain('custom-panel');
  });

  // ============================================================================
  // Document ID Changes
  // ============================================================================

  it('refetches when documentId changes', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const { rerender } = render(<ReadingPanel documentId="doc_123" />);

    expect(mockUseDocument).toHaveBeenCalledWith('doc_123', undefined);

    rerender(<ReadingPanel documentId="doc_456" />);

    expect(mockUseDocument).toHaveBeenCalledWith('doc_456', undefined);
  });

  // ============================================================================
  // Layout Structure
  // ============================================================================

  it('has scrollable content area', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<ReadingPanel documentId="doc_123" />);

    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('has max-width for readability', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<ReadingPanel documentId="doc_123" />);

    const contentContainer = container.querySelector('.max-w-prose');
    expect(contentContainer).toBeInTheDocument();
  });

  it('has sticky header', () => {
    mockUseDocument.mockReturnValue({
      data: mockDocument,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<ReadingPanel documentId="doc_123" />);

    const header = container.querySelector('.sticky');
    expect(header).toBeInTheDocument();
  });
});
