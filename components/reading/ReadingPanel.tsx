/**
 * ReadingPanel Component
 *
 * Main reading panel that displays document content alongside the graph.
 * Handles scrolling to specific sections and highlighting passages based on
 * selected nodes in the graph.
 *
 * Features:
 * - Fetches document content
 * - Displays content with DocumentViewer
 * - Scrolls to node references on click
 * - Highlights relevant passages
 * - Shows scroll position indicator
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useDocument } from '@/hooks/useDocument';
import { DocumentViewer } from './DocumentViewer';
import { ScrollIndicator } from './ScrollIndicator';
import { scrollToPosition, calculateScrollPosition } from '@/lib/scroll-utils';

// ============================================================================
// Types
// ============================================================================

export interface ReadingPanelProps {
  /**
   * Document ID to fetch and display
   */
  documentId: string;

  /**
   * Currently active node ID (from graph click)
   */
  activeNodeId?: string | null;

  /**
   * Character range to highlight
   */
  highlightRange?: {
    startOffset: number;
    endOffset: number;
  } | null;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ReadingPanel - Side panel for document reading
 *
 * @example
 * ```tsx
 * <ReadingPanel
 *   documentId="doc_abc123"
 *   activeNodeId={selectedNodeId}
 *   highlightRange={{ startOffset: 120, endOffset: 350 }}
 * />
 * ```
 */
export function ReadingPanel({
  documentId,
  activeNodeId,
  highlightRange,
  className = '',
}: ReadingPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch document data
  const { data: document, isLoading, error } = useDocument(documentId);

  // Scroll to highlighted section when highlightRange changes
  useEffect(() => {
    if (!contentRef.current || !highlightRange) return;

    // Calculate scroll position for the start offset
    const scrollPos = calculateScrollPosition(
      contentRef.current,
      highlightRange.startOffset
    );

    // Smooth scroll to position
    if (containerRef.current) {
      scrollToPosition(containerRef.current, scrollPos, 800);
    }
  }, [highlightRange]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`reading-panel ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-text-secondary">Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`reading-panel ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-error">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium">Failed to load document</p>
            <p className="text-sm text-text-muted mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // No document state
  if (!document) {
    return (
      <div className={`reading-panel ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-text-muted">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg">No document loaded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        reading-panel
        relative
        h-full
        bg-chrome
        overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-chrome border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-text-primary line-clamp-1">
          {document.title}
        </h2>
        {document.sourceType && (
          <p className="text-xs text-text-muted mt-1">
            {document.sourceType.toUpperCase()} document
          </p>
        )}
      </div>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="h-[calc(100%-5rem)] overflow-y-auto px-8 py-6"
      >
        {/* Content container with max width for readability */}
        <div
          ref={contentRef}
          className="max-w-prose mx-auto"
        >
          <DocumentViewer
            content={document.content}
            highlightRange={highlightRange}
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator
        containerRef={containerRef}
        position="bottom-right"
      />

      {/* Scroll to top button (appears when scrolled down) */}
      <ScrollToTopButton containerRef={containerRef} />
    </div>
  );
}

// ============================================================================
// Scroll to Top Button (Helper Component)
// ============================================================================

interface ScrollToTopButtonProps {
  containerRef: React.RefObject<HTMLElement>;
}

function ScrollToTopButton({ containerRef }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Show button when scrolled more than 300px
      setIsVisible(container.scrollTop > 300);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const handleClick = () => {
    if (containerRef.current) {
      scrollToPosition(containerRef.current, 0, 600);
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className="
        fixed bottom-20 right-8
        w-10 h-10
        bg-primary text-white
        rounded-full
        shadow-lg
        flex items-center justify-center
        transition-all duration-300
        hover:bg-primary-600
        hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      "
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}

// ============================================================================
// Display Name (for DevTools)
// ============================================================================

ReadingPanel.displayName = 'ReadingPanel';
