/**
 * MermaidGraph Component
 *
 * Core component for rendering interactive Mermaid.js graphs with colorful
 * node styling, event handling, zoom/pan controls, and dynamic state management.
 */

'use client';

import { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef, memo } from 'react';
import mermaid from 'mermaid';
import { getMermaidTheme } from '@/lib/mermaid-theme';
import {
  attachGraphEventHandlers,
  applyNodeStyles,
  highlightConnectedNodes,
  addSVGFilters,
  getGraphBounds,
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

  /** Zoom level from parent (1.0 = 100%) */
  zoomLevel?: number;

  /** Whether pan mode is enabled */
  panEnabled?: boolean;
}

/**
 * Imperative handle for parent components
 */
export interface MermaidGraphHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  resetTransform: () => void;
}

/**
 * MermaidGraph - Interactive graph visualization component
 *
 * Renders Mermaid.js graphs with:
 * - Colorful node type styling
 * - Click and hover event handlers
 * - Zoom and pan controls
 * - Drag to pan on empty space
 * - Mouse wheel zoom
 * - Dynamic node state visualization (notes, mastery, etc.)
 * - Connected node highlighting on hover
 * - Keyboard accessibility
 *
 * @example
 * ```tsx
 * const graphRef = useRef<MermaidGraphHandle>(null);
 *
 * <MermaidGraph
 *   ref={graphRef}
 *   graphId="graph-123"
 *   mermaidCode={graph.mermaidCode}
 *   nodes={graph.nodes}
 *   edges={graph.edges}
 *   onNodeClick={(nodeId) => console.log('Clicked:', nodeId)}
 *   zoomLevel={1.5}
 *   panEnabled={true}
 * />
 * ```
 */
const MermaidGraphComponent = forwardRef<MermaidGraphHandle, MermaidGraphProps>(
  function MermaidGraph(
    {
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
      zoomLevel = 1.0,
      panEnabled = false,
    },
    ref
  ) {
    console.log('[MermaidGraph] Component rendered:', {
      graphId,
      hasMermaidCode: !!mermaidCode,
      mermaidCodeLength: mermaidCode?.length,
      nodeCount: nodes?.length,
      zoomLevel,
      panEnabled,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const gRef = useRef<SVGGElement | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const [isRendered, setIsRendered] = useState(false);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Transform state for zoom/pan
    const [transform, setTransform] = useState({
      scale: 1.0,
      translateX: 0,
      translateY: 0,
    });

    // Initial bounds for fit-to-screen
    const initialBoundsRef = useRef<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

    // Dragging state
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragStartTransformRef = useRef({ translateX: 0, translateY: 0 });

    console.log('[MermaidGraph] State:', {
      isRendered,
      hasError: !!renderError,
      transform,
    });

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
     * Apply transform to SVG <g> element
     */
    const applyTransform = useCallback(
      (t: { scale: number; translateX: number; translateY: number }) => {
        if (gRef.current) {
          gRef.current.setAttribute(
            'transform',
            `translate(${t.translateX}, ${t.translateY}) scale(${t.scale})`
          );
        }
      },
      []
    );

    /**
     * Fit graph to container
     */
    const fitToScreen = useCallback(() => {
      if (!svgRef.current || !wrapperRef.current || !initialBoundsRef.current)
        return;

      const { clientWidth, clientHeight } = wrapperRef.current;
      const bounds = initialBoundsRef.current;
      const padding = 40;

      const scaleX = (clientWidth - padding * 2) / bounds.width;
      const scaleY = (clientHeight - padding * 2) / bounds.height;
      const scale = Math.min(scaleX, scaleY, 1.5); // Max 150% zoom

      const translateX =
        (clientWidth - bounds.width * scale) / 2 - bounds.x * scale;
      const translateY =
        (clientHeight - bounds.height * scale) / 2 - bounds.y * scale;

      const newTransform = { scale, translateX, translateY };
      setTransform(newTransform);
      applyTransform(newTransform);
    }, [applyTransform]);

    /**
     * Zoom in
     */
    const zoomIn = useCallback(() => {
      setTransform((prev) => {
        const newScale = Math.min(prev.scale * 1.2, 3.0);
        const newTransform = { ...prev, scale: newScale };
        applyTransform(newTransform);
        return newTransform;
      });
    }, [applyTransform]);

    /**
     * Zoom out
     */
    const zoomOut = useCallback(() => {
      setTransform((prev) => {
        const newScale = Math.max(prev.scale / 1.2, 0.1);
        const newTransform = { ...prev, scale: newScale };
        applyTransform(newTransform);
        return newTransform;
      });
    }, [applyTransform]);

    /**
     * Reset transform
     */
    const resetTransform = useCallback(() => {
      fitToScreen();
    }, [fitToScreen]);

    /**
     * Expose imperative methods to parent
     */
    useImperativeHandle(
      ref,
      () => ({
        zoomIn,
        zoomOut,
        fitToScreen,
        resetTransform,
      }),
      [zoomIn, zoomOut, fitToScreen, resetTransform]
    );

    /**
     * Handle mouse down for pan
     */
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        console.log('[MermaidGraph] handleMouseDown:', { panEnabled, button: e.button });

        // Only pan if pan mode is enabled or middle mouse button
        if (!panEnabled && e.button !== 1) {
          console.log('[MermaidGraph] Pan not enabled and not middle button, ignoring');
          return;
        }

        // Don't pan if clicking on a node or edge
        const target = e.target as HTMLElement;
        if (
          target.closest('.node') ||
          target.closest('.edgePath') ||
          target.closest('.edgeLabel')
        ) {
          console.log('[MermaidGraph] Clicked on node/edge, not panning');
          return;
        }

        console.log('[MermaidGraph] Starting pan');
        e.preventDefault();
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        dragStartTransformRef.current = {
          translateX: transform.translateX,
          translateY: transform.translateY,
        };

        // Change cursor
        if (wrapperRef.current) {
          wrapperRef.current.style.cursor = 'grabbing';
        }
      },
      [panEnabled, transform]
    );

    /**
     * Handle mouse move for pan
     */
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDraggingRef.current) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        const newTransform = {
          scale: transform.scale,
          translateX: dragStartTransformRef.current.translateX + dx,
          translateY: dragStartTransformRef.current.translateY + dy,
        };

        setTransform(newTransform);
        applyTransform(newTransform);
      },
      [transform.scale, applyTransform]
    );

    /**
     * Handle mouse up for pan
     */
    const handleMouseUp = useCallback(() => {
      isDraggingRef.current = false;

      // Reset cursor
      if (wrapperRef.current) {
        wrapperRef.current.style.cursor = panEnabled ? 'grab' : 'default';
      }
    }, [panEnabled]);

    /**
     * Handle mouse wheel for zoom
     */
    const handleWheel = useCallback(
      (e: WheelEvent) => {
        if (!enableZoom) return;

        e.preventDefault();

        const delta = -e.deltaY / 1000;
        const zoomFactor = 1 + delta;

        setTransform((prev) => {
          const newScale = Math.max(0.1, Math.min(3.0, prev.scale * zoomFactor));

          // Zoom toward mouse position
          const rect = svgContainerRef.current?.getBoundingClientRect();
          if (!rect) return prev;

          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          const newTranslateX =
            mouseX - ((mouseX - prev.translateX) * newScale) / prev.scale;
          const newTranslateY =
            mouseY - ((mouseY - prev.translateY) * newScale) / prev.scale;

          const newTransform = {
            scale: newScale,
            translateX: newTranslateX,
            translateY: newTranslateY,
          };

          applyTransform(newTransform);
          return newTransform;
        });
      },
      [enableZoom, applyTransform]
    );

    /**
     * Attach pan/zoom event listeners
     */
    useEffect(() => {
      if (!isRendered || !wrapperRef.current) return;

      const wrapper = wrapperRef.current;

      // Mouse events for panning
      wrapper.addEventListener('mousemove', handleMouseMove);
      wrapper.addEventListener('mouseup', handleMouseUp);
      wrapper.addEventListener('mouseleave', handleMouseUp);

      // Wheel event for zooming
      wrapper.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        wrapper.removeEventListener('mousemove', handleMouseMove);
        wrapper.removeEventListener('mouseup', handleMouseUp);
        wrapper.removeEventListener('mouseleave', handleMouseUp);
        wrapper.removeEventListener('wheel', handleWheel);
      };
    }, [isRendered, handleMouseMove, handleMouseUp, handleWheel]);

    /**
     * Update cursor based on pan mode
     */
    useEffect(() => {
      if (wrapperRef.current && isRendered) {
        wrapperRef.current.style.cursor = panEnabled ? 'grab' : 'default';
      }
    }, [panEnabled, isRendered]);

    /**
     * Render the Mermaid graph
     */
    const renderGraph = useCallback(async () => {
      console.log('[MermaidGraph] renderGraph called:', {
        hasContainer: !!svgContainerRef.current,
        hasWrapper: !!wrapperRef.current,
        hasMermaidCode: !!mermaidCode,
        mermaidCodeLength: mermaidCode?.length,
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

          // Get reference to SVG element and inner <g> element
          const svgElement = svgContainerRef.current.querySelector('svg');
          const gElement = svgElement?.querySelector('g');
          console.log('[MermaidGraph] SVG element found:', !!svgElement);
          console.log('[MermaidGraph] G element found:', !!gElement);

          if (svgElement && gElement) {
            svgRef.current = svgElement;
            gRef.current = gElement;

            // Add SVG filters for visual effects
            addSVGFilters(svgElement);

            // Make SVG responsive
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';

            // Disable all CSS transitions to prevent repositioning animations
            svgElement.style.transition = 'none';
            gElement.style.transition = 'none';

            // Remove any SVG animation elements that Mermaid might have added
            const animateElements = svgElement.querySelectorAll('animate, animateTransform, animateMotion, set');
            animateElements.forEach((el) => el.remove());

            // Disable transitions on all child elements
            const allElements = svgElement.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el instanceof HTMLElement || el instanceof SVGElement) {
                (el as HTMLElement).style.transition = 'none';
                (el as HTMLElement).style.animation = 'none';
              }
            });

            // Store initial bounds for fit-to-screen
            const bounds = getGraphBounds(svgElement);
            initialBoundsRef.current = bounds;
            console.log('[MermaidGraph] Initial bounds:', bounds);

            // Fit to container initially (only once per render)
            if (wrapperRef.current) {
              const { clientWidth, clientHeight } = wrapperRef.current;
              const padding = 40;

              const scaleX = (clientWidth - padding * 2) / bounds.width;
              const scaleY = (clientHeight - padding * 2) / bounds.height;
              const scale = Math.min(scaleX, scaleY, 1.5);

              const translateX =
                (clientWidth - bounds.width * scale) / 2 - bounds.x * scale;
              const translateY =
                (clientHeight - bounds.height * scale) / 2 - bounds.y * scale;

              const initialTransform = { scale, translateX, translateY };
              setTransform(initialTransform);

              // Apply transform directly and immediately
              if (gRef.current) {
                gRef.current.style.transition = 'none';
                gRef.current.setAttribute(
                  'transform',
                  `translate(${initialTransform.translateX}, ${initialTransform.translateY}) scale(${initialTransform.scale})`
                );
              }
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
      console.log('[MermaidGraph] useEffect triggered - mermaidCode changed, calling renderGraph');
      renderGraph();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [graphId, mermaidCode]); // Only re-render when these actually change

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
        role={isRendered ? 'img' : 'status'}
        aria-label={
          isRendered
            ? `Knowledge graph with ${nodes.length} concepts and ${edges.length} connections`
            : undefined
        }
        aria-live={isRendered ? undefined : 'polite'}
        onMouseDown={handleMouseDown}
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
);

// Custom comparison function for memo to prevent unnecessary re-renders
function arePropsEqual(
  prevProps: MermaidGraphProps,
  nextProps: MermaidGraphProps
): boolean {
  // Only re-render if these specific values change
  return (
    prevProps.graphId === nextProps.graphId &&
    prevProps.mermaidCode === nextProps.mermaidCode &&
    prevProps.activeNodeId === nextProps.activeNodeId &&
    prevProps.panEnabled === nextProps.panEnabled &&
    prevProps.enableZoom === nextProps.enableZoom
  );
}

// Wrap with memo to prevent unnecessary re-renders
export const MermaidGraph = memo(MermaidGraphComponent, arePropsEqual);

export default MermaidGraph;
