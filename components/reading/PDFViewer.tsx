/**
 * PDFViewer Component
 *
 * Renders PDF documents using PDF.js with precise coordinate-based highlighting.
 * Implements the specification from FRONTEND_PDF_HIGHLIGHTING.md
 *
 * Features:
 * - PDF rendering with PDF.js
 * - Coordinate-based text highlighting
 * - Single-page and cross-page reference support
 * - Smooth scrolling to highlighted sections
 * - Auto-cleanup of highlights
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { NodeDocumentReference } from '@/types/api.types';
import {
  highlightAllReferences,
  scrollToPage,
  getFirstPageNumber,
} from '@/lib/pdf-utils';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  // Use local worker from node_modules instead of CDN for reliability
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
  console.log('[PDFViewer] PDF.js version:', pdfjsLib.version);
  console.log('[PDFViewer] Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
}

// ============================================================================
// Types
// ============================================================================

export interface PDFViewerProps {
  /**
   * URL to the PDF file
   */
  pdfUrl: string;

  /**
   * References to highlight (from selected graph node)
   */
  highlightReferences?: NodeDocumentReference[] | null;

  /**
   * Rendering scale (default: 1.5)
   */
  scale?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Callback when PDF is loaded
   */
  onLoad?: (pageCount: number) => void;

  /**
   * Callback when PDF fails to load
   */
  onError?: (error: Error) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * PDFViewer - Renders PDF with coordinate-based highlighting
 *
 * @example
 * ```tsx
 * <PDFViewer
 *   pdfUrl="/api/documents/doc123/pdf"
 *   highlightReferences={selectedNode?.documentRefs?.references}
 *   scale={1.5}
 * />
 * ```
 */
export function PDFViewer({
  pdfUrl,
  highlightReferences,
  scale = 1.5,
  className = '',
  onLoad,
  onError,
}: PDFViewerProps) {
  console.log('[PDFViewer] Component rendered, pdfUrl:', pdfUrl);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageHeight, setPageHeight] = useState(792); // Default to letter size
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  // ============================================================================
  // PDF Rendering
  // ============================================================================

  /**
   * Load and render the PDF document
   */
  const loadPDF = useCallback(async () => {
    if (!containerRef.current || !pdfUrl) return;

    console.log('[PDFViewer] Starting PDF load:', pdfUrl);
    setIsLoading(true);
    setError(null);

    try {
      // Load PDF document
      console.log('[PDFViewer] Creating loading task...');
      const loadingTask = pdfjsLib.getDocument(pdfUrl);

      // Add progress tracking
      loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
        const percent = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
        console.log(`[PDFViewer] Loading progress: ${percent.toFixed(0)}%`);
      };

      console.log('[PDFViewer] Waiting for PDF promise...');
      const pdf = await loadingTask.promise;
      console.log('[PDFViewer] PDF loaded successfully, pages:', pdf.numPages);
      pdfDocRef.current = pdf;

      const numPages = pdf.numPages;
      setPageCount(numPages);

      // Clear container
      containerRef.current.innerHTML = '';

      // Render each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Store page height (all pages assumed same height)
        if (pageNum === 1) {
          setPageHeight(page.view[3]); // view[3] is page height in PDF points
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.dataset.pageNumber = String(pageNum - 1); // 0-indexed
        canvas.className = 'pdf-page mb-4 shadow-md';

        // Create page container
        const pageContainer = document.createElement('div');
        pageContainer.className = 'pdf-page-container relative';
        pageContainer.dataset.pageNumber = String(pageNum - 1);
        pageContainer.appendChild(canvas);

        containerRef.current.appendChild(pageContainer);

        // Render PDF page
        const context = canvas.getContext('2d');
        if (context) {
          await page.render({
            canvasContext: context,
            viewport,
          }).promise;
        }
      }

      setIsLoading(false);
      onLoad?.(numPages);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load PDF');
      console.error('[PDFViewer] Error loading PDF:', {
        error,
        message: error.message,
        stack: error.stack,
        pdfUrl,
      });
      setError(error);
      setIsLoading(false);
      onError?.(error);
    }
  }, [pdfUrl, scale, onLoad, onError]);

  // Load PDF on mount and when URL changes
  useEffect(() => {
    console.log('[PDFViewer] useEffect triggered, pdfUrl:', pdfUrl, 'containerRef:', !!containerRef.current);
    loadPDF();

    // Cleanup on unmount
    return () => {
      pdfDocRef.current?.destroy();
      pdfDocRef.current = null;
    };
  }, [loadPDF]);

  // ============================================================================
  // Highlighting
  // ============================================================================

  /**
   * Apply highlights when references change
   */
  useEffect(() => {
    console.log('[PDFViewer] Highlight useEffect triggered:', {
      isLoading,
      hasHighlightReferences: !!highlightReferences,
      highlightReferencesLength: highlightReferences?.length || 0,
      highlightReferences: highlightReferences,
      pageHeight,
      scale,
    });

    // Wait for PDF to be loaded
    if (isLoading) {
      console.log('[PDFViewer] Skipping highlights - PDF still loading');
      return;
    }

    if (!highlightReferences || highlightReferences.length === 0) {
      console.log('[PDFViewer] Skipping highlights - no references to highlight');
      return;
    }

    // Small delay to ensure canvas rendering is complete
    const timer = setTimeout(() => {
      console.log('[PDFViewer] Applying highlights to', highlightReferences.length, 'references');
      console.log('[PDFViewer] First reference:', highlightReferences[0]);

      // Highlight all references
      const result = highlightAllReferences(
        highlightReferences,
        pageHeight,
        scale,
        {
          fillColor: 'rgba(212, 165, 116, 0.3)', // Warm amber
          strokeColor: 'rgba(212, 165, 116, 0.6)',
          strokeWidth: 2,
        },
        100 // 100ms stagger between highlights
      );

      console.log('[PDFViewer] highlightAllReferences returned:', result);

      // Scroll to first reference
      const firstPage = getFirstPageNumber(highlightReferences);
      if (firstPage !== null) {
        console.log('[PDFViewer] Scrolling to page:', firstPage);
        scrollToPage(firstPage, 'smooth', 'center');
      } else {
        console.log('[PDFViewer] No first page found for scrolling');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [highlightReferences, isLoading, pageHeight, scale]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`pdf-viewer ${className} relative`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-text-secondary">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
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
            <p className="text-lg font-medium">Failed to load PDF</p>
            <p className="text-sm text-text-muted mt-2">{error.message}</p>
            <button
              onClick={loadPDF}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* PDF container - always rendered so ref is available */}
      <div
        ref={containerRef}
        className="pdf-container space-y-4"
        style={{
          maxWidth: `${(scale * 612)}px`, // 612 points = letter width
          margin: '0 auto',
        }}
      />

      {/* Page count indicator */}
      {pageCount > 0 && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg text-sm">
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Display Name (for DevTools)
// ============================================================================

PDFViewer.displayName = 'PDFViewer';
