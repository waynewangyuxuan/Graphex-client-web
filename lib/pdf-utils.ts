/**
 * PDF Utility Functions
 *
 * Utility functions for PDF coordinate conversion and highlighting.
 * Based on FRONTEND_PDF_HIGHLIGHTING.md specification.
 */

import type { NodeDocumentReference } from '@/types/api.types';

// ============================================================================
// Coordinate Conversion
// ============================================================================

/**
 * Convert PDF Y-coordinate to Canvas Y-coordinate
 *
 * PDF coordinate system: Origin at bottom-left, Y increases upward
 * Canvas coordinate system: Origin at top-left, Y increases downward
 *
 * @param pdfY - Y coordinate in PDF space (from bottom)
 * @param pdfHeight - Height of the bounding box in PDF space
 * @param pageHeight - Total page height in PDF points
 * @returns Y coordinate in canvas space (from top)
 *
 * @example
 * ```typescript
 * // If page height is 792 points (letter size):
 * const canvasY = pdfToCanvasY(720, 24, 792); // Returns 48
 * ```
 */
export function pdfToCanvasY(
  pdfY: number,
  pdfHeight: number,
  pageHeight: number
): number {
  return pageHeight - pdfY - pdfHeight;
}

/**
 * Convert PDF coordinates to Canvas coordinates with scaling
 *
 * @param pdfCoords - Bounding box in PDF coordinate system
 * @param pageHeight - Page height in PDF points
 * @param scale - Rendering scale factor (e.g., 1.5)
 * @returns Bounding box in canvas coordinate system
 *
 * @example
 * ```typescript
 * const canvasCoords = pdfToCanvasCoords(
 *   { x: 72, y: 720, width: 400, height: 24 },
 *   792,
 *   1.5
 * );
 * // Returns: { x: 108, y: 72, width: 600, height: 36 }
 * ```
 */
export function pdfToCanvasCoords(
  pdfCoords: { x: number; y: number; width: number; height: number },
  pageHeight: number,
  scale: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: pdfCoords.x * scale,
    y: pdfToCanvasY(pdfCoords.y, pdfCoords.height, pageHeight) * scale,
    width: pdfCoords.width * scale,
    height: pdfCoords.height * scale,
  };
}

// ============================================================================
// Reference Detection
// ============================================================================

/**
 * Check if a reference is a single-page reference
 *
 * @param ref - Node document reference
 * @returns True if reference is on a single page
 */
export function isSinglePageReference(
  ref: NodeDocumentReference
): ref is NodeDocumentReference & {
  page: number;
  coordinates: { x: number; y: number; width: number; height: number };
} {
  return (
    ref.page !== undefined &&
    ref.coordinates !== undefined &&
    !Array.isArray(ref.coordinates)
  );
}

/**
 * Check if a reference is a cross-page reference
 *
 * @param ref - Node document reference
 * @returns True if reference spans multiple pages
 */
export function isCrossPageReference(
  ref: NodeDocumentReference
): ref is NodeDocumentReference & {
  pages: number[];
  coordinates: Array<{
    page: number;
    bbox: { x: number; y: number; width: number; height: number };
  }>;
} {
  return (
    ref.pages !== undefined &&
    Array.isArray(ref.pages) &&
    ref.coordinates !== undefined &&
    Array.isArray(ref.coordinates)
  );
}

// ============================================================================
// Canvas Highlighting
// ============================================================================

/**
 * Highlight configuration
 */
export interface HighlightConfig {
  /** Fill color (default: warm amber rgba(212, 165, 116, 0.3)) */
  fillColor?: string;
  /** Stroke color for border (default: rgba(212, 165, 116, 0.6)) */
  strokeColor?: string;
  /** Stroke width (default: 2) */
  strokeWidth?: number;
  /** Animation duration in ms (default: 0 for no animation) */
  animationDuration?: number;
}

const DEFAULT_HIGHLIGHT_CONFIG: Required<HighlightConfig> = {
  fillColor: 'rgba(212, 165, 116, 0.3)', // Warm amber with 30% opacity
  strokeColor: 'rgba(212, 165, 116, 0.6)', // Warm amber with 60% opacity
  strokeWidth: 2,
  animationDuration: 0,
};

/**
 * Highlight a region on a canvas
 *
 * @param ctx - Canvas 2D context
 * @param bbox - Bounding box in canvas coordinates
 * @param config - Highlight styling configuration
 *
 * @example
 * ```typescript
 * const canvas = document.querySelector('canvas');
 * const ctx = canvas.getContext('2d');
 * highlightOnCanvas(ctx, { x: 100, y: 200, width: 300, height: 40 });
 * ```
 */
export function highlightOnCanvas(
  ctx: CanvasRenderingContext2D,
  bbox: { x: number; y: number; width: number; height: number },
  config: HighlightConfig = {}
): void {
  const finalConfig = { ...DEFAULT_HIGHLIGHT_CONFIG, ...config };

  // Draw highlight fill
  ctx.fillStyle = finalConfig.fillColor;
  ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);

  // Draw border for extra emphasis
  ctx.strokeStyle = finalConfig.strokeColor;
  ctx.lineWidth = finalConfig.strokeWidth;
  ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
}

/**
 * Highlight a text region on a specific page canvas
 *
 * Automatically handles PDF to canvas coordinate conversion.
 *
 * @param pageNumber - 0-indexed page number
 * @param pdfCoords - Bounding box in PDF coordinates
 * @param pageHeight - Page height in PDF points
 * @param scale - Rendering scale
 * @param config - Highlight styling configuration
 * @returns True if highlight was successful, false if canvas not found
 *
 * @example
 * ```typescript
 * const success = highlightTextRegion(
 *   5,
 *   { x: 72, y: 720, width: 400, height: 24 },
 *   792,
 *   1.5
 * );
 * ```
 */
export function highlightTextRegion(
  pageNumber: number,
  pdfCoords: { x: number; y: number; width: number; height: number },
  pageHeight: number,
  scale: number,
  config: HighlightConfig = {}
): boolean {
  // Find the canvas for this page
  const canvas = document.querySelector(
    `canvas[data-page-number="${pageNumber}"]`
  ) as HTMLCanvasElement | null;

  if (!canvas) {
    console.warn(`[highlightTextRegion] Canvas not found for page ${pageNumber}`);
    return false;
  }

  // Get canvas context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn(`[highlightTextRegion] Could not get 2D context for page ${pageNumber}`);
    return false;
  }

  // Convert PDF coordinates to canvas coordinates
  const canvasCoords = pdfToCanvasCoords(pdfCoords, pageHeight, scale);

  console.log('[highlightTextRegion] Drawing highlight:', {
    pageNumber,
    pdfCoords,
    canvasCoords,
    pageHeight,
    scale,
  });

  // Draw highlight
  highlightOnCanvas(ctx, canvasCoords, config);

  return true;
}

// ============================================================================
// HTML Overlay Highlighting
// ============================================================================

/**
 * Create an HTML overlay div for highlighting
 *
 * Alternative to canvas highlighting - allows CSS animations and effects.
 *
 * @param pageNumber - 0-indexed page number
 * @param pdfCoords - Bounding box in PDF coordinates
 * @param pageHeight - Page height in PDF points
 * @param scale - Rendering scale
 * @param config - Highlight styling configuration
 * @returns Highlight overlay element
 *
 * @example
 * ```typescript
 * const overlay = createHighlightOverlay(
 *   5,
 *   { x: 72, y: 720, width: 400, height: 24 },
 *   792,
 *   1.5
 * );
 * canvasContainer.appendChild(overlay);
 * ```
 */
export function createHighlightOverlay(
  pageNumber: number,
  pdfCoords: { x: number; y: number; width: number; height: number },
  pageHeight: number,
  scale: number,
  config: HighlightConfig = {}
): HTMLDivElement {
  const finalConfig = { ...DEFAULT_HIGHLIGHT_CONFIG, ...config };
  const canvasCoords = pdfToCanvasCoords(pdfCoords, pageHeight, scale);

  const overlay = document.createElement('div');
  overlay.className = 'pdf-highlight';
  overlay.dataset.pageNumber = String(pageNumber);

  // Position absolutely
  overlay.style.position = 'absolute';
  overlay.style.left = `${canvasCoords.x}px`;
  overlay.style.top = `${canvasCoords.y}px`;
  overlay.style.width = `${canvasCoords.width}px`;
  overlay.style.height = `${canvasCoords.height}px`;

  // Styling
  overlay.style.backgroundColor = finalConfig.fillColor;
  overlay.style.border = `${finalConfig.strokeWidth}px solid ${finalConfig.strokeColor}`;
  overlay.style.pointerEvents = 'none'; // Don't block interactions
  overlay.style.zIndex = '10';

  // Animation
  if (finalConfig.animationDuration > 0) {
    overlay.style.transition = `opacity ${finalConfig.animationDuration}ms ease-in-out`;
    overlay.style.opacity = '0';

    // Trigger animation
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
  }

  return overlay;
}

// ============================================================================
// Multi-Reference Highlighting
// ============================================================================

/**
 * Highlight all references for a node
 *
 * Handles both single-page and cross-page references automatically.
 *
 * @param references - Array of node document references
 * @param pageHeight - Page height in PDF points
 * @param scale - Rendering scale
 * @param config - Highlight styling configuration
 * @param staggerDelay - Delay between highlights in ms (default: 0)
 *
 * @example
 * ```typescript
 * const node = graph.nodes[0];
 * if (node.documentRefs) {
 *   highlightAllReferences(
 *     node.documentRefs.references,
 *     792,
 *     1.5,
 *     {},
 *     100 // 100ms stagger
 *   );
 * }
 * ```
 */
export function highlightAllReferences(
  references: NodeDocumentReference[],
  pageHeight: number,
  scale: number,
  config: HighlightConfig = {},
  staggerDelay: number = 0
): void {
  references.forEach((ref, index) => {
    const delay = index * staggerDelay;

    setTimeout(() => {
      if (isSinglePageReference(ref)) {
        // Single-page reference
        highlightTextRegion(ref.page, ref.coordinates, pageHeight, scale, config);
      } else if (isCrossPageReference(ref)) {
        // Cross-page reference - highlight on multiple pages
        ref.coordinates.forEach((coord) => {
          highlightTextRegion(coord.page, coord.bbox, pageHeight, scale, config);
        });
      } else {
        console.warn('[highlightAllReferences] Invalid reference format:', ref);
      }
    }, delay);
  });
}

// ============================================================================
// Scroll Utilities
// ============================================================================

/**
 * Scroll to a specific page in the PDF viewer
 *
 * @param pageNumber - 0-indexed page number
 * @param behavior - Scroll behavior ('smooth' or 'auto')
 * @param block - Vertical alignment ('start', 'center', 'end', 'nearest')
 *
 * @example
 * ```typescript
 * scrollToPage(5, 'smooth', 'center');
 * ```
 */
export function scrollToPage(
  pageNumber: number,
  behavior: ScrollBehavior = 'smooth',
  block: ScrollLogicalPosition = 'center'
): void {
  const canvas = document.querySelector(
    `canvas[data-page-number="${pageNumber}"]`
  );

  if (!canvas) {
    console.warn(`[scrollToPage] Canvas not found for page ${pageNumber}`);
    return;
  }

  canvas.scrollIntoView({
    behavior,
    block,
    inline: 'nearest',
  });
}

/**
 * Get the first page number from a set of references
 *
 * @param references - Array of node document references
 * @returns First page number, or null if no references
 *
 * @example
 * ```typescript
 * const firstPage = getFirstPageNumber(node.documentRefs?.references || []);
 * if (firstPage !== null) {
 *   scrollToPage(firstPage);
 * }
 * ```
 */
export function getFirstPageNumber(
  references: NodeDocumentReference[]
): number | null {
  if (references.length === 0) return null;

  const firstRef = references[0];

  if (isSinglePageReference(firstRef)) {
    return firstRef.page;
  } else if (isCrossPageReference(firstRef)) {
    return firstRef.pages[0];
  }

  return null;
}
