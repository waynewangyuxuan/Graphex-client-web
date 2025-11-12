/**
 * Upload Form Validation Schemas
 *
 * Zod validation schemas for document upload forms.
 * Validates file types, sizes, and optional document metadata.
 */

import { z } from 'zod';

// ============================================================================
// Constants
// ============================================================================

/**
 * Accepted file types and their MIME types
 */
export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md', '.markdown'],
} as const;

/**
 * Maximum file size: 10MB
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Accepted file extensions as a readable string
 */
export const ACCEPTED_EXTENSIONS = 'PDF, TXT, or MD';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if file type is accepted
 */
function isAcceptedFileType(file: File): boolean {
  return Object.keys(ACCEPTED_FILE_TYPES).includes(file.type);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * File validation schema
 *
 * Validates:
 * - File is a File instance
 * - File size is less than 10MB
 * - File type is PDF, TXT, or MD
 */
const fileSchema = z
  .instanceof(File, { message: 'Please select a file' })
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    (file) => ({
      message: `File size must be less than 10MB (current: ${formatFileSize(file.size)})`,
    })
  )
  .refine(
    (file) => isAcceptedFileType(file),
    {
      message: `Only ${ACCEPTED_EXTENSIONS} files are supported`,
    }
  );

/**
 * Document upload form schema
 *
 * Fields:
 * - file: Required File object with validation
 * - title: Optional string, max 100 characters
 *
 * @example
 * ```typescript
 * const form = useForm<DocumentUploadFormData>({
 *   resolver: zodResolver(documentUploadSchema),
 * });
 * ```
 */
export const documentUploadSchema = z.object({
  file: fileSchema,
  title: z
    .string()
    .max(100, 'Title must be less than 100 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Inferred TypeScript type from schema
 */
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

/**
 * URL upload form schema
 *
 * Fields:
 * - url: Required valid URL
 * - title: Optional string, max 100 characters
 */
export const urlUploadSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL'),
  title: z
    .string()
    .max(100, 'Title must be less than 100 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Inferred TypeScript type from URL upload schema
 */
export type UrlUploadFormData = z.infer<typeof urlUploadSchema>;
