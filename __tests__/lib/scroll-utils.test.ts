/**
 * Tests for Scroll Utility Functions
 *
 * Tests scroll, highlight, and position calculation utilities used
 * by the ReadingPanel component.
 */

import {
  scrollToElement,
  scrollToPosition,
  findElementAtOffset,
  calculateScrollPosition,
  highlightTextRange,
  highlightDocumentRange,
  highlightWithFade,
  calculateScrollPercentage,
  isElementVisible,
} from '@/lib/scroll-utils';

// ============================================================================
// Setup and Helpers
// ============================================================================

/**
 * Create mock container with paragraphs
 */
function createMockContainer(texts: string[]): HTMLDivElement {
  const container = document.createElement('div');
  container.style.height = '500px';
  container.style.overflow = 'auto';

  texts.forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    container.appendChild(p);
  });

  document.body.appendChild(container);
  return container;
}

/**
 * Cleanup DOM
 */
function cleanup() {
  document.body.innerHTML = '';
}

// ============================================================================
// Tests: scrollToElement
// ============================================================================

describe('scrollToElement', () => {
  afterEach(cleanup);

  it('scrolls element into view with default options', () => {
    const container = createMockContainer(['Para 1', 'Para 2', 'Para 3']);
    const element = container.children[1] as HTMLElement;

    // Mock scrollIntoView
    element.scrollIntoView = jest.fn();
    const scrollSpy = jest.spyOn(element, 'scrollIntoView');

    scrollToElement(element);

    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    scrollSpy.mockRestore();
  });

  it('accepts custom scroll options', () => {
    const container = createMockContainer(['Para 1', 'Para 2']);
    const element = container.children[0] as HTMLElement;

    // Mock scrollIntoView
    element.scrollIntoView = jest.fn();
    const scrollSpy = jest.spyOn(element, 'scrollIntoView');

    scrollToElement(element, { block: 'start', behavior: 'auto' });

    expect(scrollSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        block: 'start',
        behavior: 'auto',
      })
    );

    scrollSpy.mockRestore();
  });

  it('handles null element gracefully', () => {
    expect(() => {
      scrollToElement(null as any);
    }).not.toThrow();
  });
});

// ============================================================================
// Tests: scrollToPosition
// ============================================================================

describe('scrollToPosition', () => {
  afterEach(cleanup);

  it('scrolls container to specified position', (done) => {
    const container = createMockContainer([
      'Para 1',
      'Para 2',
      'Para 3',
      'Para 4',
      'Para 5',
    ]);

    scrollToPosition(container, 100, 100); // Short duration for testing

    setTimeout(() => {
      expect(container.scrollTop).toBeGreaterThan(50);
      done();
    }, 150);
  });

  it('handles null container gracefully', () => {
    expect(() => {
      scrollToPosition(null as any, 100);
    }).not.toThrow();
  });
});

// ============================================================================
// Tests: findElementAtOffset
// ============================================================================

describe('findElementAtOffset', () => {
  afterEach(cleanup);

  it('finds paragraph containing character offset', () => {
    const texts = ['First paragraph.', 'Second paragraph.', 'Third paragraph.'];
    const container = createMockContainer(texts);

    // Offset 20 should be in second paragraph
    // "First paragraph." = 16 chars
    const element = findElementAtOffset(container, 20);

    expect(element).toBeTruthy();
    expect(element?.textContent).toBe('Second paragraph.');
  });

  it('returns first paragraph for offset 0', () => {
    const container = createMockContainer(['First', 'Second']);
    const element = findElementAtOffset(container, 0);

    expect(element?.textContent).toBe('First');
  });

  it('returns last paragraph for offset beyond text', () => {
    const container = createMockContainer(['Short', 'Text']);
    const element = findElementAtOffset(container, 10000);

    expect(element?.textContent).toBe('Text');
  });

  it('returns null for empty container', () => {
    const container = document.createElement('div');
    const element = findElementAtOffset(container, 10);

    expect(element).toBeNull();
  });

  it('handles negative offset', () => {
    const container = createMockContainer(['Test']);
    const element = findElementAtOffset(container, -5);

    expect(element).toBeNull();
  });
});

// ============================================================================
// Tests: calculateScrollPosition
// ============================================================================

describe('calculateScrollPosition', () => {
  afterEach(cleanup);

  it('calculates scroll position for offset', () => {
    const container = createMockContainer([
      'Paragraph 1',
      'Paragraph 2',
      'Paragraph 3',
    ]);

    const position = calculateScrollPosition(container, 15);

    expect(position).toBeGreaterThanOrEqual(0);
    expect(typeof position).toBe('number');
  });

  it('returns 0 for offset 0', () => {
    const container = createMockContainer(['Test']);
    const position = calculateScrollPosition(container, 0);

    expect(position).toBeLessThanOrEqual(0);
  });
});

// ============================================================================
// Tests: highlightTextRange
// ============================================================================

describe('highlightTextRange', () => {
  afterEach(cleanup);

  it('highlights text range in paragraph', () => {
    const p = document.createElement('p');
    p.textContent = 'This is a test paragraph.';
    document.body.appendChild(p);

    const cleanup = highlightTextRange(p, 5, 7, 'bg-yellow');

    const mark = p.querySelector('mark');
    expect(mark).toBeTruthy();
    expect(mark?.textContent).toBe('is');
    expect(mark?.className).toContain('bg-yellow');

    cleanup();
    expect(p.querySelector('mark')).toBeNull();
  });

  it('returns cleanup function that restores original HTML', () => {
    const p = document.createElement('p');
    p.textContent = 'Original text';
    const originalHTML = p.innerHTML;
    document.body.appendChild(p);

    const cleanup = highlightTextRange(p, 0, 8, 'highlight');
    expect(p.innerHTML).not.toBe(originalHTML);

    cleanup();
    expect(p.innerHTML).toBe(originalHTML);
  });

  it('handles invalid ranges gracefully', () => {
    const p = document.createElement('p');
    p.textContent = 'Test';
    document.body.appendChild(p);

    const cleanup1 = highlightTextRange(p, 10, 20, 'highlight');
    expect(cleanup1).toBeDefined();

    const cleanup2 = highlightTextRange(p, 5, 3, 'highlight');
    expect(cleanup2).toBeDefined();
  });

  it('handles null element', () => {
    const cleanup = highlightTextRange(null as any, 0, 5, 'highlight');
    expect(cleanup).toBeDefined();
    expect(() => cleanup()).not.toThrow();
  });
});

// ============================================================================
// Tests: highlightDocumentRange
// ============================================================================

describe('highlightDocumentRange', () => {
  afterEach(cleanup);

  it('highlights range across document', () => {
    const container = createMockContainer([
      'First paragraph here.',
      'Second paragraph here.',
      'Third paragraph here.',
    ]);

    // Highlight in second paragraph (offset ~22-28)
    const cleanup = highlightDocumentRange(container, 25, 32);

    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);

    cleanup();
    expect(container.querySelectorAll('mark').length).toBe(0);
  });

  it('returns no-op cleanup for empty container', () => {
    const container = document.createElement('div');
    const cleanup = highlightDocumentRange(container, 0, 10);

    expect(cleanup).toBeDefined();
    expect(() => cleanup()).not.toThrow();
  });
});

// ============================================================================
// Tests: highlightWithFade
// ============================================================================

describe('highlightWithFade', () => {
  afterEach(cleanup);

  it('applies fade animation class', () => {
    const container = createMockContainer(['Test paragraph for fade.']);

    const cleanup = highlightWithFade(container, 5, 14, 100);

    const mark = container.querySelector('mark');
    expect(mark?.className).toContain('animate-highlight-fade');

    cleanup();
  });

  it('auto-cleans up after fade duration', (done) => {
    const container = createMockContainer(['Auto cleanup test.']);

    highlightWithFade(container, 0, 4, 50);

    expect(container.querySelector('mark')).toBeTruthy();

    setTimeout(() => {
      expect(container.querySelector('mark')).toBeNull();
      done();
    }, 100);
  });
});

// ============================================================================
// Tests: calculateScrollPercentage
// ============================================================================

describe('calculateScrollPercentage', () => {
  afterEach(cleanup);

  it('calculates scroll percentage correctly', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 50, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 200, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 100, writable: true });

    const percentage = calculateScrollPercentage(container);

    // 50 / (200 - 100) = 0.5 = 50%
    expect(percentage).toBe(50);
  });

  it('returns 100 for fully scrolled container', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 200, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 100, writable: true });

    const percentage = calculateScrollPercentage(container);

    expect(percentage).toBe(100);
  });

  it('returns 100 for non-scrollable container', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollHeight', { value: 100, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 100, writable: true });

    const percentage = calculateScrollPercentage(container);

    expect(percentage).toBe(100);
  });

  it('returns 0 for null container', () => {
    const percentage = calculateScrollPercentage(null as any);
    expect(percentage).toBe(0);
  });
});

// ============================================================================
// Tests: isElementVisible
// ============================================================================

describe('isElementVisible', () => {
  afterEach(cleanup);

  it('returns true for visible element', () => {
    const container = document.createElement('div');
    const element = document.createElement('div');

    // Mock getBoundingClientRect
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 500,
      left: 0,
      right: 500,
      width: 500,
      height: 500,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 200,
      left: 0,
      right: 500,
      width: 500,
      height: 100,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });

    const visible = isElementVisible(element, container);
    expect(visible).toBe(true);
  });

  it('returns false for element outside viewport', () => {
    const container = document.createElement('div');
    const element = document.createElement('div');

    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 500,
      left: 0,
      right: 500,
      width: 500,
      height: 500,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 600,
      bottom: 700,
      left: 0,
      right: 500,
      width: 500,
      height: 100,
      x: 0,
      y: 600,
      toJSON: () => ({}),
    });

    const visible = isElementVisible(element, container);
    expect(visible).toBe(false);
  });

  it('returns false for null elements', () => {
    expect(isElementVisible(null as any, document.createElement('div'))).toBe(false);
    expect(isElementVisible(document.createElement('div'), null as any)).toBe(false);
  });
});
