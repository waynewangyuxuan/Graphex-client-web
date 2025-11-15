/**
 * DocumentViewer Component
 *
 * Renders document content with proper formatting, paragraph identification,
 * and support for highlighting specific character ranges.
 *
 * Features:
 * - Splits content into paragraphs
 * - Applies highlight to specific character range
 * - Serif font for readability
 * - Responsive layout
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { highlightWithFade } from '@/lib/scroll-utils';

// ============================================================================
// Types
// ============================================================================

export interface DocumentViewerProps {
  /**
   * Full document text content
   */
  content: string;

  /**
   * Character range to highlight (optional)
   */
  highlightRange?: {
    startOffset: number;
    endOffset: number;
  } | null;

  /**
   * Callback when highlight is applied
   */
  onHighlightApplied?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * DocumentViewer - Renders document content with highlighting support
 *
 * @example
 * ```tsx
 * <DocumentViewer
 *   content={document.contentText}
 *   highlightRange={{ startOffset: 120, endOffset: 350 }}
 *   onHighlightApplied={() => console.log('Highlighted!')}
 * />
 * ```
 */
export function DocumentViewer({
  content,
  highlightRange,
  onHighlightApplied,
  className = '',
}: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Split content into paragraphs (by double newline or single newline)
  const paragraphs = React.useMemo(() => {
    if (!content) return [];

    // Split by double newline first, then fallback to single newline
    let parts = content.split(/\n\n+/);
    if (parts.length === 1) {
      parts = content.split(/\n/);
    }

    // Filter out empty paragraphs
    return parts.filter((p) => p.trim().length > 0);
  }, [content]);

  // Apply highlight when highlightRange changes
  useEffect(() => {
    // Cleanup previous highlight
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Apply new highlight
    if (containerRef.current && highlightRange) {
      cleanupRef.current = highlightWithFade(
        containerRef.current,
        highlightRange.startOffset,
        highlightRange.endOffset,
        2000 // 2 second fade
      );

      onHighlightApplied?.();
    }

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [highlightRange, onHighlightApplied, content]);

  // Empty state
  if (!content || paragraphs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <div className="text-center">
          <p className="text-lg">No document content available</p>
          <p className="text-sm mt-2">
            Click a node in the graph to view related content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`
        document-viewer
        font-serif text-base leading-relaxed
        text-text-primary
        ${className}
      `}
    >
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="mb-4 last:mb-0"
          data-paragraph-index={index}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// Display Name (for DevTools)
// ============================================================================

DocumentViewer.displayName = 'DocumentViewer';
