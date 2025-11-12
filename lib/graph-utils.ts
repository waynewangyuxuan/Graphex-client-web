/**
 * Graph Visualization Utilities
 *
 * Helper functions for manipulating Mermaid-generated SVG elements,
 * attaching event handlers, and applying dynamic node styling.
 */

import { NODE_STATE_COLORS } from './mermaid-theme';

/**
 * Node state for dynamic styling
 */
export interface NodeState {
  hasNotes?: boolean;
  isMastered?: boolean;
  needsReview?: boolean;
  isActive?: boolean;
  isHovered?: boolean;
}

/**
 * Graph event handlers
 */
export interface GraphEventHandlers {
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  onEdgeClick?: (edgeId: string) => void;
  onEdgeHover?: (edgeId: string | null) => void;
}

/**
 * Attach event handlers to Mermaid-generated SVG elements
 *
 * This function queries the SVG DOM after Mermaid rendering and attaches
 * click and hover event listeners to nodes and edges.
 *
 * @param svgElement - The SVG element containing the graph
 * @param handlers - Event handler callbacks
 * @returns Cleanup function to remove all event listeners
 *
 * @example
 * ```typescript
 * const cleanup = attachGraphEventHandlers(svgRef.current, {
 *   onNodeClick: (nodeId) => console.log('Clicked node:', nodeId),
 *   onEdgeClick: (edgeId) => console.log('Clicked edge:', edgeId),
 * });
 *
 * // Later, on unmount:
 * cleanup();
 * ```
 */
export function attachGraphEventHandlers(
  svgElement: SVGSVGElement,
  handlers: GraphEventHandlers
): () => void {
  const eventListeners: Array<{
    element: Element;
    event: string;
    handler: EventListener;
  }> = [];

  // Attach node event handlers
  const nodeElements = svgElement.querySelectorAll('.node');
  nodeElements.forEach((nodeElement) => {
    const nodeId = getNodeIdFromElement(nodeElement);
    if (!nodeId) return;

    // Click handler
    if (handlers.onNodeClick) {
      const clickHandler = (e: Event) => {
        e.stopPropagation();
        handlers.onNodeClick!(nodeId);
      };
      nodeElement.addEventListener('click', clickHandler);
      eventListeners.push({ element: nodeElement, event: 'click', handler: clickHandler });
    }

    // Hover handlers
    if (handlers.onNodeHover) {
      const mouseEnterHandler = () => {
        handlers.onNodeHover!(nodeId);
      };
      const mouseLeaveHandler = () => {
        handlers.onNodeHover!(null);
      };

      nodeElement.addEventListener('mouseenter', mouseEnterHandler);
      nodeElement.addEventListener('mouseleave', mouseLeaveHandler);

      eventListeners.push(
        { element: nodeElement, event: 'mouseenter', handler: mouseEnterHandler },
        { element: nodeElement, event: 'mouseleave', handler: mouseLeaveHandler }
      );
    }

    // Make node keyboard accessible
    nodeElement.setAttribute('role', 'button');
    nodeElement.setAttribute('tabindex', '0');
    nodeElement.setAttribute('aria-label', `Graph node. Press Enter to view details.`);

    // Keyboard handler
    if (handlers.onNodeClick) {
      const keyHandler = (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          e.preventDefault();
          handlers.onNodeClick!(nodeId);
        }
      };
      nodeElement.addEventListener('keydown', keyHandler);
      eventListeners.push({ element: nodeElement, event: 'keydown', handler: keyHandler });
    }

    // Add cursor pointer
    (nodeElement as HTMLElement).style.cursor = 'pointer';
  });

  // Attach edge event handlers
  const edgeElements = svgElement.querySelectorAll('.edgePath');
  edgeElements.forEach((edgeElement) => {
    const edgeId = getEdgeIdFromElement(edgeElement);
    if (!edgeId) return;

    // Click handler
    if (handlers.onEdgeClick) {
      const clickHandler = (e: Event) => {
        e.stopPropagation();
        handlers.onEdgeClick!(edgeId);
      };
      edgeElement.addEventListener('click', clickHandler);
      eventListeners.push({ element: edgeElement, event: 'click', handler: clickHandler });
    }

    // Hover handlers
    if (handlers.onEdgeHover) {
      const mouseEnterHandler = () => {
        handlers.onEdgeHover!(edgeId);
      };
      const mouseLeaveHandler = () => {
        handlers.onEdgeHover!(null);
      };

      edgeElement.addEventListener('mouseenter', mouseEnterHandler);
      edgeElement.addEventListener('mouseleave', mouseLeaveHandler);

      eventListeners.push(
        { element: edgeElement, event: 'mouseenter', handler: mouseEnterHandler },
        { element: edgeElement, event: 'mouseleave', handler: mouseLeaveHandler }
      );
    }

    // Make edge keyboard accessible
    edgeElement.setAttribute('role', 'button');
    edgeElement.setAttribute('tabindex', '0');
    edgeElement.setAttribute('aria-label', 'Graph connection. Press Enter to view explanation.');

    // Add cursor pointer
    (edgeElement as HTMLElement).style.cursor = 'pointer';
  });

  // Return cleanup function
  return () => {
    eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
  };
}

/**
 * Apply dynamic styling to nodes based on their state
 *
 * Updates SVG node elements with visual indicators for notes, mastery, etc.
 *
 * @param svgElement - The SVG element containing the graph
 * @param nodeStates - Map of node IDs to their states
 *
 * @example
 * ```typescript
 * applyNodeStyles(svgRef.current, {
 *   'node-1': { hasNotes: true },
 *   'node-2': { isMastered: true },
 *   'node-3': { needsReview: true, isActive: true },
 * });
 * ```
 */
export function applyNodeStyles(
  svgElement: SVGSVGElement,
  nodeStates: Record<string, NodeState>
): void {
  const nodeElements = svgElement.querySelectorAll('.node');

  nodeElements.forEach((nodeElement) => {
    const nodeId = getNodeIdFromElement(nodeElement);
    if (!nodeId) return;

    const state = nodeStates[nodeId];
    if (!state) return;

    // Find the main shape element (rect, circle, etc.)
    const shapeElement = nodeElement.querySelector('rect, circle, polygon');
    if (!shapeElement) return;

    // Apply state-based styling
    if (state.hasNotes) {
      // Gold border for nodes with notes
      shapeElement.setAttribute('stroke', NODE_STATE_COLORS.withNotes);
      shapeElement.setAttribute('stroke-width', '3');
    }

    if (state.isMastered) {
      // Green background for mastered nodes
      shapeElement.setAttribute('fill', NODE_STATE_COLORS.mastered);
      shapeElement.setAttribute('stroke', NODE_STATE_COLORS.mastered);
    }

    if (state.needsReview) {
      // Red-orange background for needs review
      shapeElement.setAttribute('fill', NODE_STATE_COLORS.needsReview);
      shapeElement.setAttribute('stroke', NODE_STATE_COLORS.needsReview);
    }

    if (state.isActive) {
      // Add active border
      const currentStrokeWidth = shapeElement.getAttribute('stroke-width') || '2';
      shapeElement.setAttribute('stroke-width', String(Number(currentStrokeWidth) + 1));
      shapeElement.setAttribute('filter', 'url(#activeGlow)');
    }

    if (state.isHovered) {
      // Add hover effect
      (nodeElement as HTMLElement).style.transform = 'scale(1.05)';
      (nodeElement as HTMLElement).style.transition = 'transform 200ms ease-out';
      (nodeElement as HTMLElement).style.filter = 'drop-shadow(0 4px 12px rgba(33, 150, 243, 0.15))';
    } else {
      // Remove hover effect
      (nodeElement as HTMLElement).style.transform = 'scale(1)';
      (nodeElement as HTMLElement).style.filter = 'none';
    }
  });
}

/**
 * Highlight connected nodes when a node is hovered
 *
 * @param svgElement - The SVG element containing the graph
 * @param nodeId - ID of the hovered node (null to clear highlights)
 */
export function highlightConnectedNodes(
  svgElement: SVGSVGElement,
  nodeId: string | null
): void {
  const nodeElements = svgElement.querySelectorAll('.node');
  const edgeElements = svgElement.querySelectorAll('.edgePath');

  if (!nodeId) {
    // Clear all highlights
    nodeElements.forEach((node) => {
      (node as HTMLElement).style.opacity = '1';
    });
    edgeElements.forEach((edge) => {
      (edge as HTMLElement).style.opacity = '1';
    });
    return;
  }

  // Find connected nodes and edges
  const connectedNodeIds = new Set<string>();
  connectedNodeIds.add(nodeId);

  edgeElements.forEach((edgeElement) => {
    const edgeId = getEdgeIdFromElement(edgeElement);
    if (!edgeId) return;

    // Parse edge ID to get from/to nodes (format: "nodeA-nodeB" or similar)
    const [fromId, toId] = edgeId.split('-');

    if (fromId === nodeId || toId === nodeId) {
      // This edge is connected to the hovered node
      (edgeElement as HTMLElement).style.opacity = '1';
      connectedNodeIds.add(fromId);
      connectedNodeIds.add(toId);
    } else {
      // Dim unconnected edges
      (edgeElement as HTMLElement).style.opacity = '0.3';
    }
  });

  // Highlight connected nodes, dim others
  nodeElements.forEach((nodeElement) => {
    const nId = getNodeIdFromElement(nodeElement);
    if (!nId) return;

    if (connectedNodeIds.has(nId)) {
      (nodeElement as HTMLElement).style.opacity = '1';
    } else {
      (nodeElement as HTMLElement).style.opacity = '0.3';
    }
  });
}

/**
 * Extract node ID from SVG element
 *
 * Mermaid generates nodes with class names like "node-A", "node-B", etc.
 * This function extracts the ID portion.
 *
 * @param element - SVG node element
 * @returns Node ID or null if not found
 */
export function getNodeIdFromElement(element: Element): string | null {
  // Try getting from data attribute first
  const dataId = element.getAttribute('data-node-id');
  if (dataId) return dataId;

  // Try extracting from class name
  const classList = element.getAttribute('class');
  if (!classList) return null;

  // Mermaid typically uses "node default" or "node-A" format
  const match = classList.match(/node-([^\s]+)/);
  if (match) return match[1];

  // Try ID attribute
  const id = element.getAttribute('id');
  if (id?.startsWith('flowchart-')) {
    return id.replace('flowchart-', '').replace(/-\d+$/, '');
  }

  return null;
}

/**
 * Extract edge ID from SVG element
 *
 * @param element - SVG edge element
 * @returns Edge ID or null if not found
 */
export function getEdgeIdFromElement(element: Element): string | null {
  // Try getting from data attribute
  const dataId = element.getAttribute('data-edge-id');
  if (dataId) return dataId;

  // Try extracting from class name
  const classList = element.getAttribute('class');
  if (!classList) return null;

  // Look for edge class pattern
  const match = classList.match(/edge-([^\s]+)/);
  if (match) return match[1];

  // Try ID attribute
  const id = element.getAttribute('id');
  if (id?.includes('-edge-')) {
    return id;
  }

  return null;
}

/**
 * Add SVG filter definitions for visual effects
 *
 * Adds glow and shadow filters to the SVG for enhanced interactivity
 *
 * @param svgElement - The SVG element
 */
export function addSVGFilters(svgElement: SVGSVGElement): void {
  // Check if filters already exist
  if (svgElement.querySelector('#activeGlow')) return;

  const defs = svgElement.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  if (!svgElement.querySelector('defs')) {
    svgElement.insertBefore(defs, svgElement.firstChild);
  }

  // Active glow filter
  const activeGlow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  activeGlow.setAttribute('id', 'activeGlow');
  activeGlow.setAttribute('x', '-50%');
  activeGlow.setAttribute('y', '-50%');
  activeGlow.setAttribute('width', '200%');
  activeGlow.setAttribute('height', '200%');

  const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  feGaussianBlur.setAttribute('in', 'SourceAlpha');
  feGaussianBlur.setAttribute('stdDeviation', '3');

  const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
  feOffset.setAttribute('dx', '0');
  feOffset.setAttribute('dy', '0');
  feOffset.setAttribute('result', 'offsetblur');

  const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
  const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
  feFuncA.setAttribute('type', 'linear');
  feFuncA.setAttribute('slope', '0.5');
  feComponentTransfer.appendChild(feFuncA);

  const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
  const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  feMergeNode2.setAttribute('in', 'SourceGraphic');

  feMerge.appendChild(feMergeNode1);
  feMerge.appendChild(feMergeNode2);

  activeGlow.appendChild(feGaussianBlur);
  activeGlow.appendChild(feOffset);
  activeGlow.appendChild(feComponentTransfer);
  activeGlow.appendChild(feMerge);

  defs.appendChild(activeGlow);
}

/**
 * Calculate graph bounds for zoom/pan operations
 *
 * @param svgElement - The SVG element
 * @returns Bounding box of the graph content
 */
export function getGraphBounds(svgElement: SVGSVGElement): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const bbox = svgElement.getBBox();
  return {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height,
  };
}

/**
 * Fit graph to container (zoom to fit)
 *
 * @param svgElement - The SVG element
 * @param containerWidth - Width of container
 * @param containerHeight - Height of container
 * @param padding - Padding around graph (default 24)
 */
export function fitGraphToContainer(
  svgElement: SVGSVGElement,
  containerWidth: number,
  containerHeight: number,
  padding: number = 24
): void {
  const bounds = getGraphBounds(svgElement);

  const scaleX = (containerWidth - padding * 2) / bounds.width;
  const scaleY = (containerHeight - padding * 2) / bounds.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

  const translateX = (containerWidth - bounds.width * scale) / 2 - bounds.x * scale;
  const translateY = (containerHeight - bounds.height * scale) / 2 - bounds.y * scale;

  const g = svgElement.querySelector('g');
  if (g) {
    g.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
  }
}
