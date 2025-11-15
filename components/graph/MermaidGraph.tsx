/**
 * MermaidGraph Component
 *
 * Core component for rendering interactive Mermaid.js graphs with colorful
 * node styling, event handling, and dynamic state management.
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import mermaid from 'mermaid';
import { getMermaidTheme } from '@/lib/mermaid-theme';
import {
  attachGraphEventHandlers,
  applyNodeStyles,
  highlightConnectedNodes,
  addSVGFilters,
  fitGraphToContainer,
  type NodeState,
  type GraphEventHandlers,
} from '@/lib/graph-utils';
import type { GraphNode, GraphEdge } from '@/types/api.types';

/**
 * Props for MermaidGraph component
 */
export interface MermaidGraphProps {
  /** Unique graph ID */
  graphId: string;

  /** Mermaid syntax code to render */
  mermaidCode: string;

  /** Graph nodes for metadata */
  nodes: GraphNode[];

  /** Graph edges for metadata */
  edges: GraphEdge[];

  /** Callback when node is clicked */
  onNodeClick?: (nodeId: string) => void;

  /** Callback when edge is clicked */
  onEdgeClick?: (edgeId: string) => void;

  /** Currently active/selected node ID */
  activeNodeId?: string | null;

  /** Node states for dynamic styling */
  nodeStates?: Record<string, NodeState>;

  /** Custom CSS class name */
  className?: string;

  /** Enable zoom and pan controls */
  enableZoom?: boolean;

  /** Initial zoom level (default 1.0) */
  initialZoom?: number;
}

/**
 * MermaidGraph - Interactive graph visualization component
 *
 * Renders Mermaid.js graphs with:
 * - Colorful node type styling
 * - Click and hover event handlers
 * - Dynamic node state visualization (notes, mastery, etc.)
 * - Connected node highlighting on hover
 * - Keyboard accessibility
 * - SVG manipulation for enhanced interactivity
 *
 * @example
 * ```tsx
 * <MermaidGraph
 *   graphId="graph-123"
 *   mermaidCode={graph.mermaidCode}
 *   nodes={graph.nodes}
 *   edges={graph.edges}
 *   onNodeClick={(nodeId) => console.log('Clicked:', nodeId)}
 *   activeNodeId="node-1"
 *   nodeStates={{
 *     'node-1': { hasNotes: true, isActive: true },
 *     'node-2': { isMastered: true },
 *   }}
 * />
 * ```
 */
export function MermaidGraph({
  graphId,
  mermaidCode,
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  activeNodeId,
  nodeStates = {},
  className = '',
  enableZoom = true,
  initialZoom = 1.0,
}: MermaidGraphProps) {
  console.log('[MermaidGraph] Component rendered:', {
    graphId,
    hasMermaidCode: !!mermaidCode,
    mermaidCodeLength: mermaidCode?.length,
    nodeCount: nodes?.length
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  console.log('[MermaidGraph] State:', { isRendered, hasError: !!renderError });

  /**
   * Initialize Mermaid with our custom theme
   */
  useEffect(() => {
    try {
      mermaid.initialize(getMermaidTheme());
    } catch (error) {
      console.error('Failed to initialize Mermaid:', error);
      setRenderError('Failed to initialize graph renderer');
    }
  }, []);

  /**
   * Render the Mermaid graph
   */
  const renderGraph = useCallback(async () => {
    console.log('[MermaidGraph] renderGraph called:', {
      hasContainer: !!svgContainerRef.current,
      hasWrapper: !!wrapperRef.current,
      hasMermaidCode: !!mermaidCode,
      mermaidCodeLength: mermaidCode?.length
    });

    if (!svgContainerRef.current || !mermaidCode) {
      console.log('[MermaidGraph] Skipping render - no container or code');
      return;
    }

    try {
      console.log('[MermaidGraph] Starting render...');
      setRenderError(null);
      setIsRendered(false);

      // Generate unique ID for this render
      const elementId = `mermaid-${graphId}-${Date.now()}`;
      console.log('[MermaidGraph] Generated element ID:', elementId);

      // Render Mermaid graph
      console.log('[MermaidGraph] Calling mermaid.render...');
      const { svg } = await mermaid.render(elementId, mermaidCode);
      console.log('[MermaidGraph] Mermaid render complete, SVG length:', svg?.length);

      // Insert SVG into dedicated container (not React-managed)
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = svg;

        // Get reference to SVG element
        const svgElement = svgContainerRef.current.querySelector('svg');
        console.log('[MermaidGraph] SVG element found:', !!svgElement);

        if (svgElement) {
          svgRef.current = svgElement;

          // Add SVG filters for visual effects
          addSVGFilters(svgElement);

          // Make SVG responsive
          svgElement.style.width = '100%';
          svgElement.style.height = '100%';

          // Fit to container
          if (wrapperRef.current) {
            const { clientWidth, clientHeight } = wrapperRef.current;
            fitGraphToContainer(svgElement, clientWidth, clientHeight);
          }

          console.log('[MermaidGraph] Setting isRendered to true');
          setIsRendered(true);
        }
      }
    } catch (error) {
      console.error('[MermaidGraph] Render error:', error);
      setRenderError(
        error instanceof Error ? error.message : 'Failed to render graph'
      );
    }
  }, [graphId, mermaidCode]);

  /**
   * Attach event handlers after rendering
   */
  useEffect(() => {
    if (!isRendered || !svgRef.current) return;

    // Clean up previous handlers
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Create event handlers
    const handlers: GraphEventHandlers = {
      onNodeClick: (nodeId) => {
        onNodeClick?.(nodeId);
      },
      onNodeHover: (nodeId) => {
        setHoveredNodeId(nodeId);
        if (svgRef.current) {
          highlightConnectedNodes(svgRef.current, nodeId);
        }
      },
      onEdgeClick: (edgeId) => {
        onEdgeClick?.(edgeId);
      },
    };

    // Attach handlers and store cleanup function
    cleanupRef.current = attachGraphEventHandlers(svgRef.current, handlers);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [isRendered, onNodeClick, onEdgeClick]);

  /**
   * Apply dynamic node styling based on state
   */
  useEffect(() => {
    if (!isRendered || !svgRef.current) return;

    // Build complete node states including active and hovered
    const completeNodeStates = { ...nodeStates };

    // Mark active node
    if (activeNodeId) {
      completeNodeStates[activeNodeId] = {
        ...completeNodeStates[activeNodeId],
        isActive: true,
      };
    }

    // Mark hovered node
    if (hoveredNodeId) {
      completeNodeStates[hoveredNodeId] = {
        ...completeNodeStates[hoveredNodeId],
        isHovered: true,
      };
    }

    // Apply styles
    applyNodeStyles(svgRef.current, completeNodeStates);
  }, [isRendered, nodeStates, activeNodeId, hoveredNodeId]);

  /**
   * Render graph when mermaidCode changes
   */
  useEffect(() => {
    console.log('[MermaidGraph] useEffect triggered - calling renderGraph');
    renderGraph();
  }, [renderGraph]);

  /**
   * Handle window resize - re-fit graph
   */
  useEffect(() => {
    if (!isRendered || !svgRef.current || !wrapperRef.current) return;

    const handleResize = () => {
      if (svgRef.current && wrapperRef.current) {
        const { clientWidth, clientHeight } = wrapperRef.current;
        fitGraphToContainer(svgRef.current, clientWidth, clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isRendered]);

  // Render error state
  if (renderError) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-canvas ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center">
          <div className="text-error text-lg font-semibold mb-2">
            Failed to render graph
          </div>
          <div className="text-text-secondary text-sm">{renderError}</div>
          <button
            onClick={renderGraph}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render container
  return (
    <div
      ref={wrapperRef}
      className={`w-full h-full bg-canvas overflow-hidden ${className}`}
      role={isRendered ? "img" : "status"}
      aria-label={isRendered ? `Knowledge graph with ${nodes.length} concepts and ${edges.length} connections` : undefined}
      aria-live={isRendered ? undefined : "polite"}
    >
      {/* Show loading state while rendering */}
      {!isRendered && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <div className="text-text-secondary">Rendering graph...</div>
            </div>
          </div>
        </div>
      )}
      {/* SVG container - managed via direct DOM manipulation */}
      <div
        ref={svgContainerRef}
        className="w-full h-full"
        style={{ display: isRendered ? 'block' : 'none' }}
      />
    </div>
  );
}

export default MermaidGraph;
