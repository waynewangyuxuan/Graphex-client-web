/**
 * FilePreview Component
 *
 * Displays selected file information including name, size, and type.
 * Shows a remove button to clear the selection.
 */

import * as React from 'react';
import { FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/schemas/upload.schema';

export interface FilePreviewProps {
  /**
   * File to preview
   */
  file: File;
  /**
   * Callback when remove button is clicked
   */
  onRemove: () => void;
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * FilePreview displays selected file info with a remove button
 *
 * @example
 * ```tsx
 * <FilePreview
 *   file={selectedFile}
 *   onRemove={() => setSelectedFile(null)}
 * />
 * ```
 */
export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
  // Get file extension
  const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border-2 border-primary bg-chrome p-4',
        'transition-all duration-200',
        className
      )}
    >
      {/* File icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
        <FileText className="h-6 w-6 text-primary" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">
          {file.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="rounded bg-primary-50 px-2 py-0.5 font-medium text-primary">
            {extension}
          </span>
          <span>{formatFileSize(file.size)}</span>
        </div>
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        aria-label="Remove file"
        className="shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
