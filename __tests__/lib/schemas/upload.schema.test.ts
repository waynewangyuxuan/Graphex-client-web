/**
 * Upload Schema Tests
 *
 * Tests for document upload validation schemas.
 */

import {
  documentUploadSchema,
  urlUploadSchema,
  formatFileSize,
  MAX_FILE_SIZE,
} from '@/lib/schemas/upload.schema';

// ============================================================================
// Helper Functions
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

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(100)).toBe('100 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('formats fractional sizes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5 KB
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB'); // 2.5 MB
  });
});

describe('documentUploadSchema', () => {
  // ==========================================================================
  // Valid Cases
  // ==========================================================================

  describe('valid files', () => {
    it('accepts valid PDF file', () => {
      const file = createTestFile('test.pdf', 'application/pdf', 1024 * 1024);
      const result = documentUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it('accepts valid text file', () => {
      const file = createTestFile('document.txt', 'text/plain', 500 * 1024);
      const result = documentUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it('accepts valid markdown file', () => {
      const file = createTestFile('notes.md', 'text/markdown', 2 * 1024 * 1024);
      const result = documentUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it('accepts file at maximum size (10MB)', () => {
      const file = createTestFile('large.pdf', 'application/pdf', MAX_FILE_SIZE);
      const result = documentUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it('accepts optional title', () => {
      const file = createTestFile('test.pdf', 'application/pdf', 1024);
      const result = documentUploadSchema.safeParse({
        file,
        title: 'My Document',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('My Document');
      }
    });

    it('accepts empty title', () => {
      const file = createTestFile('test.pdf', 'application/pdf', 1024);
      const result = documentUploadSchema.safeParse({ file, title: '' });
      expect(result.success).toBe(true);
    });

    it('accepts missing title', () => {
      const file = createTestFile('test.pdf', 'application/pdf', 1024);
      const result = documentUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // Invalid Cases - File Size
  // ==========================================================================

  describe('file size validation', () => {
    it('rejects file over 10MB', () => {
      const file = createTestFile(
        'large.pdf',
        'application/pdf',
        MAX_FILE_SIZE + 1
      );
      const result = documentUploadSchema.safeParse({ file });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toMatch(/must be less than 10MB/i);
      }
    });

    it('includes actual file size in error message', () => {
      const file = createTestFile(
        'huge.pdf',
        'application/pdf',
        15 * 1024 * 1024 // 15MB
      );
      const result = documentUploadSchema.safeParse({ file });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toMatch(/15 MB/);
      }
    });
  });

  // ==========================================================================
  // Invalid Cases - File Type
  // ==========================================================================

  describe('file type validation', () => {
    it('rejects image files', () => {
      const file = createTestFile('image.jpg', 'image/jpeg', 1024);
      const result = documentUploadSchema.safeParse({ file });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toMatch(/PDF, TXT, or MD/i);
      }
    });

    it('rejects Word documents', () => {
      const file = createTestFile(
        'document.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        1024
      );
      const result = documentUploadSchema.safeParse({ file });

      expect(result.success).toBe(false);
    });

    it('rejects video files', () => {
      const file = createTestFile('video.mp4', 'video/mp4', 1024);
      const result = documentUploadSchema.safeParse({ file });

      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // Invalid Cases - Title
  // ==========================================================================

  describe('title validation', () => {
    it('rejects title over 100 characters', () => {
      const file = createTestFile('test.pdf', 'application/pdf', 1024);
      const longTitle = 'a'.repeat(101);
      const result = documentUploadSchema.safeParse({ file, title: longTitle });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toMatch(/less than 100 characters/i);
      }
    });

    it('accepts title at exactly 100 characters', () => {
      const file = createTestFile('test.pdf', 'application/pdf', 1024);
      const maxTitle = 'a'.repeat(100);
      const result = documentUploadSchema.safeParse({ file, title: maxTitle });

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // Invalid Cases - Missing File
  // ==========================================================================

  describe('missing file', () => {
    it('rejects missing file', () => {
      const result = documentUploadSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it('rejects null file', () => {
      const result = documentUploadSchema.safeParse({ file: null });

      expect(result.success).toBe(false);
    });

    it('rejects undefined file', () => {
      const result = documentUploadSchema.safeParse({ file: undefined });

      expect(result.success).toBe(false);
    });
  });
});

describe('urlUploadSchema', () => {
  // ==========================================================================
  // Valid Cases
  // ==========================================================================

  describe('valid URLs', () => {
    it('accepts valid HTTP URL', () => {
      const result = urlUploadSchema.safeParse({
        url: 'http://example.com/article',
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid HTTPS URL', () => {
      const result = urlUploadSchema.safeParse({
        url: 'https://example.com/article',
      });
      expect(result.success).toBe(true);
    });

    it('accepts URL with path and query params', () => {
      const result = urlUploadSchema.safeParse({
        url: 'https://example.com/articles/123?ref=twitter',
      });
      expect(result.success).toBe(true);
    });

    it('accepts optional title', () => {
      const result = urlUploadSchema.safeParse({
        url: 'https://example.com',
        title: 'Article Title',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Article Title');
      }
    });

    it('accepts empty title', () => {
      const result = urlUploadSchema.safeParse({
        url: 'https://example.com',
        title: '',
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // Invalid Cases
  // ==========================================================================

  describe('invalid URLs', () => {
    it('rejects empty URL', () => {
      const result = urlUploadSchema.safeParse({ url: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toMatch(/URL is required/i);
      }
    });

    it('rejects invalid URL format', () => {
      const result = urlUploadSchema.safeParse({ url: 'not-a-url' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toMatch(/valid URL/i);
      }
    });

    it('rejects missing URL', () => {
      const result = urlUploadSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it('rejects title over 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = urlUploadSchema.safeParse({
        url: 'https://example.com',
        title: longTitle,
      });

      expect(result.success).toBe(false);
    });
  });
});
