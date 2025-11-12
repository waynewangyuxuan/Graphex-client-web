/**
 * Scroll and Highlight Utility Functions
 *
 * Helper functions for smooth scrolling and text highlighting in the reading panel.
 * Used by ReadingPanel to synchronize with graph node clicks.
 */

// ============================================================================
// Smooth Scrolling
// ============================================================================

/**
 * Smoothly scroll an element into view
 *
 * @param element - The HTML element to scroll to
 * @param options - Scroll behavior options
 *
 * @example
 * ```typescript
 * const paragraph = document.getElementById('para-3');
 * scrollToElement(paragraph, { block: 'center', behavior: 'smooth' });
 * ```
 */
export function scrollToElement(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void {
  if (!element) return;

  const defaultOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  };

  element.scrollIntoView({
    ...defaultOptions,
    ...options,
  });
}

/**
 * Scroll container to specific position
 *
 * @param container - Scrollable container element
 * @param position - Y position to scroll to
 * @param duration - Animation duration in milliseconds (default: 800ms)
 *
 * @example
 * ```typescript
 * scrollToPosition(readingPanelRef.current, 1500, 800);
 * ```
 */
export function scrollToPosition(
  container: HTMLElement,
  position: number,
  duration: number = 800
): void {
  if (!container) return;

  const start = container.scrollTop;
  const distance = position - start;
  const startTime = performance.now();

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);

    container.scrollTop = start + distance * easeProgress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// ============================================================================
// Text Offset and Position Calculation
// ============================================================================

/**
 * Find the paragraph element containing a specific character offset
 *
 * Assumes document content is split into paragraph elements.
 * Calculates cumulative text length to find the matching paragraph.
 *
 * @param container - Container element with paragraph children
 * @param offset - Character offset in the full document text
 * @returns The paragraph element containing the offset, or null
 *
 * @example
 * ```typescript
 * const container = document.getElementById('document-content');
 * const paragraph = findElementAtOffset(container, 1523);
 * if (paragraph) {
 *   scrollToElement(paragraph);
 * }
 * ```
 */
export function findElementAtOffset(
  container: HTMLElement,
  offset: number
): HTMLElement | null {
  if (!container || offset < 0) return null;

  // Get all paragraph elements
  const paragraphs = container.querySelectorAll('p');
  if (paragraphs.length === 0) return null;

  let cumulativeLength = 0;

  for (const paragraph of paragraphs) {
    const text = paragraph.textContent || '';
    const paragraphLength = text.length;

    // Check if offset falls within this paragraph
    if (offset <= cumulativeLength + paragraphLength) {
      return paragraph as HTMLElement;
    }

    cumulativeLength += paragraphLength;
  }

  // If offset is beyond all text, return last paragraph
  return paragraphs[paragraphs.length - 1] as HTMLElement;
}

/**
 * Calculate scroll position for a given character offset
 *
 * @param container - Container element
 * @param offset - Character offset
 * @returns Scroll position in pixels
 */
export function calculateScrollPosition(
  container: HTMLElement,
  offset: number
): number {
  const element = findElementAtOffset(container, offset);
  if (!element) return 0;

  // Get element's position relative to container
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return element.offsetTop - containerRect.height / 2;
}

// ============================================================================
// Text Highlighting
// ============================================================================

/**
 * Highlight a text range within a paragraph element
 *
 * Wraps the specified character range in a <mark> element with the given class.
 * Returns a cleanup function to remove the highlight.
 *
 * @param paragraph - Paragraph element containing the text
 * @param startOffset - Start character offset within paragraph
 * @param endOffset - End character offset within paragraph
 * @param highlightClass - CSS class to apply to the highlight
 * @returns Cleanup function to remove highlight
 *
 * @example
 * ```typescript
 * const paragraph = document.getElementById('para-5');
 * const cleanup = highlightTextRange(paragraph, 20, 85, 'bg-yellow-100');
 *
 * // Later, remove highlight
 * setTimeout(cleanup, 3000);
 * ```
 */
export function highlightTextRange(
  paragraph: HTMLElement,
  startOffset: number,
  endOffset: number,
  highlightClass: string = 'bg-yellow-100'
): () => void {
  if (!paragraph) return () => {};

  const text = paragraph.textContent || '';
  if (startOffset < 0 || endOffset > text.length || startOffset >= endOffset) {
    return () => {};
  }

  // Save original HTML
  const originalHTML = paragraph.innerHTML;

  // Split text into three parts
  const beforeText = text.substring(0, startOffset);
  const highlightText = text.substring(startOffset, endOffset);
  const afterText = text.substring(endOffset);

  // Create highlighted HTML
  const mark = document.createElement('mark');
  mark.className = highlightClass;
  mark.textContent = highlightText;

  paragraph.innerHTML = '';
  paragraph.appendChild(document.createTextNode(beforeText));
  paragraph.appendChild(mark);
  paragraph.appendChild(document.createTextNode(afterText));

  // Return cleanup function
  return () => {
    paragraph.innerHTML = originalHTML;
  };
}

/**
 * Highlight text range across the entire document
 *
 * Finds the paragraph containing the offset and highlights the relevant portion.
 * Uses DocumentReference format from API.
 *
 * @param container - Container element with paragraph children
 * @param startOffset - Start character offset in full document
 * @param endOffset - End character offset in full document
 * @param highlightClass - CSS class to apply
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const container = document.getElementById('document-content');
 * const cleanup = highlightDocumentRange(container, 1500, 1650, 'bg-yellow-100');
 *
 * // Auto-cleanup after fade animation
 * setTimeout(cleanup, 2000);
 * ```
 */
export function highlightDocumentRange(
  container: HTMLElement,
  startOffset: number,
  endOffset: number,
  highlightClass: string = 'bg-yellow-100 transition-colors duration-[2000ms]'
): () => void {
  if (!container) return () => {};

  const paragraphs = container.querySelectorAll('p');
  if (paragraphs.length === 0) return () => {};

  let cumulativeLength = 0;
  let targetParagraph: HTMLElement | null = null;
  let localStartOffset = 0;
  let localEndOffset = 0;

  // Find the paragraph containing the start offset
  for (const paragraph of paragraphs) {
    const text = paragraph.textContent || '';
    const paragraphLength = text.length;

    if (startOffset <= cumulativeLength + paragraphLength) {
      targetParagraph = paragraph as HTMLElement;
      localStartOffset = startOffset - cumulativeLength;
      localEndOffset = Math.min(endOffset - cumulativeLength, paragraphLength);
      break;
    }

    cumulativeLength += paragraphLength;
  }

  if (!targetParagraph) return () => {};

  // Apply highlight
  return highlightTextRange(
    targetParagraph,
    localStartOffset,
    localEndOffset,
    highlightClass
  );
}

/**
 * Add highlight with automatic fade-out
 *
 * Applies highlight that automatically fades to transparent over specified duration.
 *
 * @param container - Container element
 * @param startOffset - Start offset
 * @param endOffset - End offset
 * @param fadeDuration - Fade duration in milliseconds (default: 2000ms)
 * @returns Cleanup function
 */
export function highlightWithFade(
  container: HTMLElement,
  startOffset: number,
  endOffset: number,
  fadeDuration: number = 2000
): () => void {
  const cleanup = highlightDocumentRange(
    container,
    startOffset,
    endOffset,
    'animate-highlight-fade'
  );

  // Auto-cleanup after fade completes
  const timeoutId = setTimeout(cleanup, fadeDuration);

  // Return enhanced cleanup that also clears timeout
  return () => {
    clearTimeout(timeoutId);
    cleanup();
  };
}

// ============================================================================
// Scroll Indicator Helpers
// ============================================================================

/**
 * Calculate scroll percentage for scroll indicator
 *
 * @param container - Scrollable container
 * @returns Scroll percentage (0-100)
 */
export function calculateScrollPercentage(container: HTMLElement): number {
  if (!container) return 0;

  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  if (scrollHeight <= clientHeight) return 100;

  return Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
}

/**
 * Check if element is visible in scrollable container
 *
 * @param element - Element to check
 * @param container - Scrollable container
 * @returns True if element is visible
 */
export function isElementVisible(
  element: HTMLElement,
  container: HTMLElement
): boolean {
  if (!element || !container) return false;

  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return (
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom
  );
}

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Highlight range for use with reading panel
 */
export interface HighlightRange {
  startOffset: number;
  endOffset: number;
}

/**
 * Scroll position with optional behavior
 */
export interface ScrollOptions {
  position?: number;
  element?: HTMLElement;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
}
