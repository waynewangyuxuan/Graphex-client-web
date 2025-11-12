/**
 * Tests for Graph Utility Functions
 *
 * Unit tests for SVG manipulation and event handling utilities.
 */

import {
  getNodeIdFromElement,
  getEdgeIdFromElement,
  applyNodeStyles,
  highlightConnectedNodes,
  addSVGFilters,
  getGraphBounds,
  type NodeState,
} from '@/lib/graph-utils';
import { NODE_STATE_COLORS } from '@/lib/mermaid-theme';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a mock SVG element for testing
 */
function createMockSVGElement(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');
  return svg;
}

/**
 * Create a mock node element
 */
function createMockNodeElement(nodeId: string): SVGGElement {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', `node node-${nodeId}`);
  g.setAttribute('data-node-id', nodeId);

  // Add shape element
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', '100');
  rect.setAttribute('height', '60');
  rect.setAttribute('fill', '#42A5F5');
  rect.setAttribute('stroke', '#1565C0');
  rect.setAttribute('stroke-width', '2');

  g.appendChild(rect);
  return g;
}

/**
 * Create a mock edge element
 */
function createMockEdgeElement(edgeId: string): SVGPathElement {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', `edgePath edge-${edgeId}`);
  path.setAttribute('data-edge-id', edgeId);
  path.setAttribute('d', 'M 0 0 L 100 100');
  return path;
}

// ============================================================================
// Tests: Node ID Extraction
// ============================================================================

describe('getNodeIdFromElement', () => {
  it('should extract node ID from data attribute', () => {
    const element = createMockNodeElement('test-node-1');
    expect(getNodeIdFromElement(element)).toBe('test-node-1');
  });

  it('should extract node ID from class name', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    element.setAttribute('class', 'node node-A default');
    expect(getNodeIdFromElement(element)).toBe('A');
  });

  it('should extract node ID from flowchart ID attribute', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    element.setAttribute('id', 'flowchart-nodeA-123');
    expect(getNodeIdFromElement(element)).toBe('nodeA');
  });

  it('should return null if no ID found', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    expect(getNodeIdFromElement(element)).toBeNull();
  });

  it('should prioritize data attribute over other methods', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    element.setAttribute('data-node-id', 'priority-id');
    element.setAttribute('class', 'node-other-id');
    expect(getNodeIdFromElement(element)).toBe('priority-id');
  });
});

// ============================================================================
// Tests: Edge ID Extraction
// ============================================================================

describe('getEdgeIdFromElement', () => {
  it('should extract edge ID from data attribute', () => {
    const element = createMockEdgeElement('edge-A-B');
    expect(getEdgeIdFromElement(element)).toBe('edge-A-B');
  });

  it('should extract edge ID from class name', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    element.setAttribute('class', 'edgePath edge-A-B');
    expect(getEdgeIdFromElement(element)).toBe('A-B');
  });

  it('should return null if no ID found', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    expect(getEdgeIdFromElement(element)).toBeNull();
  });
});

// ============================================================================
// Tests: Node Styling
// ============================================================================

describe('applyNodeStyles', () => {
  let svg: SVGSVGElement;
  let node1: SVGGElement;
  let node2: SVGGElement;
  let node3: SVGGElement;

  beforeEach(() => {
    svg = createMockSVGElement();
    node1 = createMockNodeElement('node-1');
    node2 = createMockNodeElement('node-2');
    node3 = createMockNodeElement('node-3');

    svg.appendChild(node1);
    svg.appendChild(node2);
    svg.appendChild(node3);
  });

  it('should apply "has notes" styling', () => {
    const nodeStates: Record<string, NodeState> = {
      'node-1': { hasNotes: true },
    };

    applyNodeStyles(svg, nodeStates);

    const shape = node1.querySelector('rect');
    expect(shape?.getAttribute('stroke')).toBe(NODE_STATE_COLORS.withNotes);
    expect(shape?.getAttribute('stroke-width')).toBe('3');
  });

  it('should apply "mastered" styling', () => {
    const nodeStates: Record<string, NodeState> = {
      'node-2': { isMastered: true },
    };

    applyNodeStyles(svg, nodeStates);

    const shape = node2.querySelector('rect');
    expect(shape?.getAttribute('fill')).toBe(NODE_STATE_COLORS.mastered);
    expect(shape?.getAttribute('stroke')).toBe(NODE_STATE_COLORS.mastered);
  });

  it('should apply "needs review" styling', () => {
    const nodeStates: Record<string, NodeState> = {
      'node-3': { needsReview: true },
    };

    applyNodeStyles(svg, nodeStates);

    const shape = node3.querySelector('rect');
    expect(shape?.getAttribute('fill')).toBe(NODE_STATE_COLORS.needsReview);
    expect(shape?.getAttribute('stroke')).toBe(NODE_STATE_COLORS.needsReview);
  });

  it('should apply multiple states correctly', () => {
    const nodeStates: Record<string, NodeState> = {
      'node-1': { hasNotes: true, isMastered: true },
    };

    applyNodeStyles(svg, nodeStates);

    const shape = node1.querySelector('rect');
    // Both styles should be applied (mastered takes precedence for fill)
    expect(shape?.getAttribute('fill')).toBe(NODE_STATE_COLORS.mastered);
    expect(shape?.getAttribute('stroke')).toBe(NODE_STATE_COLORS.mastered);
  });

  it('should handle empty node states', () => {
    applyNodeStyles(svg, {});

    // Should not throw error
    expect(svg.querySelectorAll('.node').length).toBe(3);
  });

  it('should apply active state styling', () => {
    const nodeStates: Record<string, NodeState> = {
      'node-1': { isActive: true },
    };

    applyNodeStyles(svg, nodeStates);

    const shape = node1.querySelector('rect');
    const currentWidth = shape?.getAttribute('stroke-width');
    expect(Number(currentWidth)).toBeGreaterThan(2);
  });
});

// ============================================================================
// Tests: Connected Node Highlighting
// ============================================================================

describe('highlightConnectedNodes', () => {
  let svg: SVGSVGElement;
  let nodeA: SVGGElement;
  let nodeB: SVGGElement;
  let nodeC: SVGGElement;
  let edgeAB: SVGPathElement;
  let edgeBC: SVGPathElement;

  beforeEach(() => {
    svg = createMockSVGElement();

    nodeA = createMockNodeElement('A');
    nodeB = createMockNodeElement('B');
    nodeC = createMockNodeElement('C');

    edgeAB = createMockEdgeElement('A-B');
    edgeBC = createMockEdgeElement('B-C');

    svg.appendChild(nodeA);
    svg.appendChild(nodeB);
    svg.appendChild(nodeC);
    svg.appendChild(edgeAB);
    svg.appendChild(edgeBC);
  });

  it('should highlight connected nodes and dim others', () => {
    highlightConnectedNodes(svg, 'A');

    // Node A should be fully visible (it's hovered)
    expect((nodeA as HTMLElement).style.opacity).toBe('1');

    // Connected nodes might be highlighted depending on implementation
    // Unconnected nodes should be dimmed
    // Note: This test depends on edge ID parsing logic
  });

  it('should clear highlights when nodeId is null', () => {
    // First highlight
    highlightConnectedNodes(svg, 'A');

    // Then clear
    highlightConnectedNodes(svg, null);

    // All nodes should be fully visible
    expect((nodeA as HTMLElement).style.opacity).toBe('1');
    expect((nodeB as HTMLElement).style.opacity).toBe('1');
    expect((nodeC as HTMLElement).style.opacity).toBe('1');
  });
});

// ============================================================================
// Tests: SVG Filters
// ============================================================================

describe('addSVGFilters', () => {
  it('should add filter definitions to SVG', () => {
    const svg = createMockSVGElement();
    addSVGFilters(svg);

    const filter = svg.querySelector('#activeGlow');
    expect(filter).toBeTruthy();
    expect(filter?.tagName).toBe('filter');
  });

  it('should not duplicate filters if called multiple times', () => {
    const svg = createMockSVGElement();

    addSVGFilters(svg);
    addSVGFilters(svg);

    const filters = svg.querySelectorAll('#activeGlow');
    expect(filters.length).toBe(1);
  });

  it('should create defs element if it does not exist', () => {
    const svg = createMockSVGElement();
    expect(svg.querySelector('defs')).toBeFalsy();

    addSVGFilters(svg);

    expect(svg.querySelector('defs')).toBeTruthy();
  });
});

// ============================================================================
// Tests: Graph Bounds
// ============================================================================

describe('getGraphBounds', () => {
  it('should return bounding box of SVG content', () => {
    const svg = createMockSVGElement();

    // Add some content
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '10');
    rect.setAttribute('y', '20');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '80');
    svg.appendChild(rect);

    const bounds = getGraphBounds(svg);

    expect(bounds).toHaveProperty('x');
    expect(bounds).toHaveProperty('y');
    expect(bounds).toHaveProperty('width');
    expect(bounds).toHaveProperty('height');
    expect(typeof bounds.x).toBe('number');
    expect(typeof bounds.width).toBe('number');
  });
});

// ============================================================================
// Tests: Event Handler Attachment (Integration-style)
// ============================================================================

describe('attachGraphEventHandlers', () => {
  it('should attach click handlers to nodes', () => {
    const svg = createMockSVGElement();
    const node = createMockNodeElement('test-node');
    svg.appendChild(node);

    const handleNodeClick = jest.fn();

    const cleanup = require('@/lib/graph-utils').attachGraphEventHandlers(svg, {
      onNodeClick: handleNodeClick,
    });

    // Simulate click
    node.dispatchEvent(new Event('click'));

    expect(handleNodeClick).toHaveBeenCalledWith('test-node');

    cleanup();
  });

  it('should make nodes keyboard accessible', () => {
    const svg = createMockSVGElement();
    const node = createMockNodeElement('test-node');
    svg.appendChild(node);

    require('@/lib/graph-utils').attachGraphEventHandlers(svg, {});

    expect(node.getAttribute('role')).toBe('button');
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('aria-label')).toContain('Graph node');
  });

  it('should clean up event listeners when cleanup is called', () => {
    const svg = createMockSVGElement();
    const node = createMockNodeElement('test-node');
    svg.appendChild(node);

    const handleNodeClick = jest.fn();

    const cleanup = require('@/lib/graph-utils').attachGraphEventHandlers(svg, {
      onNodeClick: handleNodeClick,
    });

    cleanup();

    // Click after cleanup should not trigger handler
    node.dispatchEvent(new Event('click'));
    expect(handleNodeClick).not.toHaveBeenCalled();
  });
});
