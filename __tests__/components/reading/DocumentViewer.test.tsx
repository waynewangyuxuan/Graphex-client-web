/**
 * Tests for DocumentViewer Component
 *
 * Tests document rendering, paragraph splitting, and highlighting.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { DocumentViewer } from '@/components/reading/DocumentViewer';
import * as scrollUtils from '@/lib/scroll-utils';

// Mock scroll utilities
jest.mock('@/lib/scroll-utils', () => ({
  highlightWithFade: jest.fn(() => jest.fn()),
}));

describe('DocumentViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering
  // ============================================================================

  it('renders document content split into paragraphs', () => {
    const content = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';

    render(<DocumentViewer content={content} />);

    const paragraphs = screen.getAllByText(/paragraph/i);
    expect(paragraphs.length).toBe(3);
  });

  it('splits content by single newline when no double newlines', () => {
    const content = 'Line 1\nLine 2\nLine 3';

    render(<DocumentViewer content={content} />);

    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
    expect(screen.getByText('Line 3')).toBeInTheDocument();
  });

  it('filters out empty paragraphs', () => {
    const content = 'Paragraph 1\n\n\n\nParagraph 2';

    const { container } = render(<DocumentViewer content={content} />);

    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(2);
  });

  it('applies serif font class', () => {
    const { container } = render(<DocumentViewer content="Test content" />);

    const viewer = container.firstChild as HTMLElement;
    expect(viewer.className).toContain('font-serif');
  });

  it('applies custom className', () => {
    const { container } = render(
      <DocumentViewer content="Test" className="custom-class" />
    );

    const viewer = container.firstChild as HTMLElement;
    expect(viewer.className).toContain('custom-class');
  });

  // ============================================================================
  // Empty States
  // ============================================================================

  it('shows empty state when no content', () => {
    render(<DocumentViewer content="" />);

    expect(
      screen.getByText(/no document content available/i)
    ).toBeInTheDocument();
  });

  it('shows empty state hint', () => {
    render(<DocumentViewer content="" />);

    expect(
      screen.getByText(/click a node in the graph to view related content/i)
    ).toBeInTheDocument();
  });

  // ============================================================================
  // Highlighting
  // ============================================================================

  it('applies highlight when highlightRange is provided', () => {
    const content = 'This is a test document with some content.';
    const highlightRange = { startOffset: 10, endOffset: 24 };

    render(<DocumentViewer content={content} highlightRange={highlightRange} />);

    expect(scrollUtils.highlightWithFade).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      10,
      24,
      2000
    );
  });

  it('calls onHighlightApplied callback', () => {
    const onHighlightApplied = jest.fn();
    const content = 'Test content';
    const highlightRange = { startOffset: 0, endOffset: 4 };

    render(
      <DocumentViewer
        content={content}
        highlightRange={highlightRange}
        onHighlightApplied={onHighlightApplied}
      />
    );

    expect(onHighlightApplied).toHaveBeenCalled();
  });

  it('cleans up previous highlight when range changes', async () => {
    const mockCleanup = jest.fn();
    (scrollUtils.highlightWithFade as jest.Mock).mockReturnValue(mockCleanup);

    const content = 'Test content for highlight changes.';
    const { rerender } = render(
      <DocumentViewer
        content={content}
        highlightRange={{ startOffset: 0, endOffset: 4 }}
      />
    );

    expect(scrollUtils.highlightWithFade).toHaveBeenCalledTimes(1);

    // Change highlight range
    rerender(
      <DocumentViewer
        content={content}
        highlightRange={{ startOffset: 5, endOffset: 12 }}
      />
    );

    await waitFor(() => {
      expect(mockCleanup).toHaveBeenCalled();
      expect(scrollUtils.highlightWithFade).toHaveBeenCalledTimes(2);
    });
  });

  it('cleans up highlight on unmount', () => {
    const mockCleanup = jest.fn();
    (scrollUtils.highlightWithFade as jest.Mock).mockReturnValue(mockCleanup);

    const { unmount } = render(
      <DocumentViewer
        content="Test"
        highlightRange={{ startOffset: 0, endOffset: 4 }}
      />
    );

    unmount();

    expect(mockCleanup).toHaveBeenCalled();
  });

  it('does not apply highlight when highlightRange is null', () => {
    render(<DocumentViewer content="Test content" highlightRange={null} />);

    expect(scrollUtils.highlightWithFade).not.toHaveBeenCalled();
  });

  // ============================================================================
  // Data Attributes
  // ============================================================================

  it('adds paragraph index data attribute', () => {
    const content = 'Para 1\n\nPara 2\n\nPara 3';
    const { container } = render(<DocumentViewer content={content} />);

    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs[0].getAttribute('data-paragraph-index')).toBe('0');
    expect(paragraphs[1].getAttribute('data-paragraph-index')).toBe('1');
    expect(paragraphs[2].getAttribute('data-paragraph-index')).toBe('2');
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  it('uses semantic HTML elements', () => {
    const content = 'Test paragraph 1\n\nTest paragraph 2';
    const { container } = render(<DocumentViewer content={content} />);

    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('renders text content as text nodes', () => {
    const content = 'Simple text content';
    render(<DocumentViewer content={content} />);

    const paragraph = screen.getByText('Simple text content');
    expect(paragraph.tagName).toBe('P');
  });
});
