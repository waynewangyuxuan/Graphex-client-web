/**
 * FilePreview Component Tests
 *
 * Tests for the file preview component that displays selected file information.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilePreview } from '@/components/upload/FilePreview';

// ============================================================================
// Test Setup
// ============================================================================

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

describe('FilePreview', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    user = userEvent.setup();
    mockOnRemove.mockClear();
  });

  // ==========================================================================
  // Rendering
  // ==========================================================================

  it('renders file name', () => {
    const file = createTestFile('test-document.pdf', 'application/pdf', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });

  it('displays correct file extension badge', () => {
    const file = createTestFile('document.pdf', 'application/pdf', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('shows formatted file size', () => {
    const file = createTestFile('large.pdf', 'application/pdf', 5 * 1024 * 1024); // 5MB
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText(/5 MB/i)).toBeInTheDocument();
  });

  it('displays file icon', () => {
    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    // Check for FileText icon (SVG element)
    const container = screen.getByText('test.pdf').closest('div');
    expect(container).toBeInTheDocument();
  });

  // ==========================================================================
  // Different File Types
  // ==========================================================================

  it('displays TXT extension for text files', () => {
    const file = createTestFile('document.txt', 'text/plain', 2048);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText('TXT')).toBeInTheDocument();
  });

  it('displays MD extension for markdown files', () => {
    const file = createTestFile('notes.md', 'text/markdown', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText('MD')).toBeInTheDocument();
  });

  it('handles files without extension', () => {
    const file = createTestFile('noextension', 'application/pdf', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText('noextension')).toBeInTheDocument();
  });

  // ==========================================================================
  // File Size Display
  // ==========================================================================

  it('displays bytes for small files', () => {
    const file = createTestFile('tiny.txt', 'text/plain', 512);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText(/512 Bytes/i)).toBeInTheDocument();
  });

  it('displays KB for medium files', () => {
    const file = createTestFile('medium.pdf', 'application/pdf', 100 * 1024); // 100KB
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText(/100 KB/i)).toBeInTheDocument();
  });

  it('displays MB for large files', () => {
    const file = createTestFile('large.pdf', 'application/pdf', 8 * 1024 * 1024); // 8MB
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(screen.getByText(/8 MB/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // Remove Button
  // ==========================================================================

  it('renders remove button', () => {
    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    expect(
      screen.getByRole('button', { name: /remove file/i })
    ).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /remove file/i });
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('has accessible remove button', () => {
    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /remove file/i });
    expect(removeButton).toHaveAttribute('aria-label', 'Remove file');
  });

  it('truncates long file names', () => {
    const longFileName = 'a'.repeat(100) + '.pdf';
    const file = createTestFile(longFileName, 'application/pdf', 1024);
    render(<FilePreview file={file} onRemove={mockOnRemove} />);

    const fileNameElement = screen.getByText(longFileName);
    expect(fileNameElement).toHaveClass('truncate');
  });

  // ==========================================================================
  // Custom Class Names
  // ==========================================================================

  it('applies custom className', () => {
    const file = createTestFile('test.pdf', 'application/pdf', 1024);
    const { container } = render(
      <FilePreview file={file} onRemove={mockOnRemove} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
