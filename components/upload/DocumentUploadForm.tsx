/**
 * DocumentUploadForm Component
 *
 * File upload form with drag-and-drop support using react-dropzone.
 * Validates file type (PDF, TXT, MD) and size (max 10MB).
 * Integrates with React Hook Form and Zod for validation.
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/useToast';
import { useUploadDocument } from '@/hooks';
import { FilePreview } from './FilePreview';
import {
  documentUploadSchema,
  type DocumentUploadFormData,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  ACCEPTED_EXTENSIONS,
} from '@/lib/schemas/upload.schema';

export interface DocumentUploadFormProps {
  /**
   * Additional class names for the form container
   */
  className?: string;
  /**
   * Callback on successful upload (before redirect)
   */
  onUploadSuccess?: (documentId: string) => void;
}

/**
 * DocumentUploadForm with drag-and-drop and validation
 *
 * Features:
 * - Drag and drop file upload
 * - Click to browse files
 * - File validation (type and size)
 * - Optional document title input
 * - Upload progress tracking
 * - Error handling with clear messages
 *
 * @example
 * ```tsx
 * <DocumentUploadForm
 *   onUploadSuccess={(docId) => console.log('Uploaded:', docId)}
 * />
 * ```
 */
export function DocumentUploadForm({
  className,
  onUploadSuccess,
}: DocumentUploadFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // ============================================================================
  // Form Setup
  // ============================================================================

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      title: '',
    },
  });

  const selectedFile = watch('file');

  // ============================================================================
  // Upload Mutation
  // ============================================================================

  const uploadMutation = useUploadDocument({
    onSuccess: (data) => {
      toast({
        title: 'Upload successful',
        description: 'Processing your document...',
        variant: 'success',
      });

      // Call optional callback
      onUploadSuccess?.(data.id);

      // Redirect to processing page
      router.push(`/processing?docId=${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try again',
        variant: 'error',
      });
      setUploadProgress(0);
    },
  });

  // ============================================================================
  // Dropzone Setup
  // ============================================================================

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDrop: (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const error = rejection.errors[0];

        let errorMessage = 'Invalid file';
        if (error.code === 'file-too-large') {
          errorMessage = `File is too large. Maximum size is 10MB.`;
        } else if (error.code === 'file-invalid-type') {
          errorMessage = `Invalid file type. Only ${ACCEPTED_EXTENSIONS} files are supported.`;
        }

        toast({
          title: 'Invalid file',
          description: errorMessage,
          variant: 'error',
        });
        return;
      }

      // Set accepted file
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setValue('file', file, { shouldValidate: true });

        // Auto-fill title from filename (without extension)
        if (!watch('title')) {
          const titleFromFilename = file.name.replace(/\.[^/.]+$/, '');
          setValue('title', titleFromFilename);
        }
      }
    },
  });

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const onSubmit = (data: DocumentUploadFormData) => {
    setUploadProgress(0);

    uploadMutation.mutate(
      {
        file: data.file,
        title: data.title,
        config: {
          onUploadProgress: (progress) => {
            setUploadProgress(progress);
          },
        },
      }
    );
  };

  const handleRemoveFile = () => {
    setValue('file', undefined as unknown as File);
    setUploadProgress(0);
  };

  // ============================================================================
  // Render
  // ============================================================================

  const isUploading = uploadMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Dropzone Area */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={cn(
            'relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center',
            'rounded-lg border-2 border-dashed p-8 transition-all duration-200',
            'hover:border-primary hover:bg-primary-50/50',
            // Default state
            !isDragActive && !isDragReject && 'border-primary bg-background',
            // Drag active (valid file)
            isDragActive && !isDragReject && 'border-primary bg-primary-50 border-solid',
            // Drag reject (invalid file)
            isDragReject && 'border-error bg-error/5'
          )}
        >
          <input {...getInputProps()} />

          {/* Icon */}
          <div
            className={cn(
              'mb-4 flex h-16 w-16 items-center justify-center rounded-full',
              'transition-colors duration-200',
              isDragActive && !isDragReject ? 'bg-primary text-white' : 'bg-primary-100 text-primary',
              isDragReject && 'bg-error/10 text-error'
            )}
          >
            {isDragReject ? (
              <AlertCircle className="h-8 w-8" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="mb-2 text-base font-medium text-text-primary">
              {isDragActive && !isDragReject ? (
                'Drop your file here'
              ) : isDragReject ? (
                'Invalid file type or size'
              ) : (
                <>
                  <span className="text-primary">Click to upload</span> or drag
                  and drop
                </>
              )}
            </p>
            <p className="text-sm text-text-secondary">
              {ACCEPTED_EXTENSIONS} (max 10MB)
            </p>
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && !isUploading && (
        <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
      )}

      {/* Error Message */}
      {errors.file && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.file.message}</span>
        </div>
      )}

      {/* Title Input (Optional) */}
      {selectedFile && !isUploading && (
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Document Title (Optional)"
              placeholder="Enter a title for your document"
              helperText="Defaults to filename if left empty"
              error={errors.title?.message}
            />
          )}
        />
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-4">
          <FilePreview
            file={selectedFile}
            onRemove={() => {}} // Disabled during upload
          />
          <Progress
            value={uploadProgress}
            label="Uploading..."
            showPercentage
            variant="primary"
          />
        </div>
      )}

      {/* Submit Button */}
      {selectedFile && !isUploading && (
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isUploading || !!errors.file}
        >
          Upload Document
        </Button>
      )}

      {/* Loading State */}
      {isUploading && (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          disabled
          isLoading
        >
          Uploading...
        </Button>
      )}
    </form>
  );
}
