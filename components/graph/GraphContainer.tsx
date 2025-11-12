/**
 * GraphContainer Component
 *
 * Complete graph visualization wrapper that combines:
 * - MermaidGraph (core renderer)
 * - GraphControls (zoom/pan)
 * - NodeLegend (color guide)
 * - Loading states
 * - Error states
 * - Empty states
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { MermaidGraph, type MermaidGraphProps } from './MermaidGraph';
import { GraphControls } from './GraphControls';
import { NodeLegend } from './NodeLegend';
import { FileQuestion, AlertCircle } from 'lucide-react';
import type { NodeState } from '@/lib/graph-utils';

/**
 * Props for GraphContainer component
 */
export interface GraphContainerProps
  extends Omit<MermaidGraphProps, 'className' | 'enableZoom' | 'initialZoom'> {
  /** Show legend (default true) */
  showLegend?: boolean;

  /** Show controls (default true) */
  showControls?: boolean;

  /** Loading state */
  isLoading?: boolean;

  /** Error message */
  error?: Error | string | null;

  /** Empty state message */
  emptyMessage?: string;

  /** Custom CSS class name */
  className?: string;
}

/**
 * Loading skeleton for graph
 */
function GraphSkeleton() {
  return (
    <div className="w-full h-full bg-canvas animate-pulse p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Simulated nodes */}
        <div className="flex justify-center gap-4">
          <div className="w-32 h-20 bg-primary-200 rounded-lg" />
          <div className="w-32 h-20 bg-primary-200 rounded-lg" />
          <div className="w-32 h-20 bg-primary-200 rounded-lg" />
        </div>
        <div className="flex justify-center gap-8">
          <div className="w-32 h-20 bg-primary-200 rounded-lg" />
          <div className="w-32 h-20 bg-primary-200 rounded-lg" />
        </div>
        <div className="flex justify-center gap-4">
          <div className="w-32 h-20 bg-primary-200 rounded-lg" />
          <div className="w-32 h-20 bg-primary-200 rounded-lg" />
          <div className="w-32 h-20 bg-primary-200 rounded-lg" />
        </div>
      </div>
      <div className="text-center mt-8">
        <div className="text-text-secondary text-sm">Rendering graph...</div>
      </div>
    </div>
  );
}

/**
 * Error state for graph
 */
function GraphError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div
      className="w-full h-full bg-canvas flex items-center justify-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md px-4">
        <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Failed to Load Graph
        </h3>
        <p className="text-text-secondary mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state for graph
 */
function GraphEmpty({ message }: { message?: string }) {
  return (
    <div className="w-full h-full bg-canvas flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <FileQuestion className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          No Graph Available
        </h3>
        <p className="text-text-secondary">
          {message || 'Upload a document to generate a knowledge graph.'}
        </p>
      </div>
    </div>
  );
}

/**
 * GraphContainer - Complete graph visualization wrapper
 *
 * Combines all graph-related components into a single container with:
 * - Graph rendering
 * - Zoom/pan controls
 * - Color legend
 * - Loading/error/empty states
 * - Responsive layout
 *
 * This is the primary component to use for displaying graphs in the app.
 *
 * @example
 * ```tsx
 * import { GraphContainer } from '@/components/graph';
 *
 * function GraphPage({ graphId }) {
 *   const { data: graph, isLoading, error } = useGraph(graphId);
 *   const [activeNodeId, setActiveNodeId] = useState(null);
 *
 *   if (isLoading) return <GraphContainer isLoading />;
 *   if (error) return <GraphContainer error={error} />;
 *   if (!graph) return <GraphContainer emptyMessage="Graph not found" />;
 *
 *   return (
 *     <GraphContainer
 *       graphId={graph.id}
 *       mermaidCode={graph.mermaidCode}
 *       nodes={graph.nodes}
 *       edges={graph.edges}
 *       onNodeClick={setActiveNodeId}
 *       activeNodeId={activeNodeId}
 *       nodeStates={{
 *         'node-1': { hasNotes: true },
 *         'node-2': { isMastered: true },
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function GraphContainer({
  graphId,
  mermaidCode,
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  activeNodeId,
  nodeStates = {},
  showLegend = true,
  showControls = true,
  isLoading = false,
  error = null,
  emptyMessage,
  className = '',
}: GraphContainerProps) {
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panEnabled, setPanEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handle zoom in
   */
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.0));
  }, []);

  /**
   * Handle zoom out
   */
  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.1));
  }, []);

  /**
   * Handle fit to screen
   */
  const handleFitToScreen = useCallback(() => {
    setZoomLevel(1.0);
    // The MermaidGraph component will handle the actual fitting
  }, []);

  /**
   * Handle pan mode toggle
   */
  const handleTogglePan = useCallback((enabled: boolean) => {
    setPanEnabled(enabled);
    // Update cursor style
    if (containerRef.current) {
      containerRef.current.style.cursor = enabled ? 'grab' : 'default';
    }
  }, []);

  /**
   * Handle retry on error
   */
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <GraphSkeleton />
      </div>
    );
  }

  // Show error state
  if (error) {
    const errorMessage =
      typeof error === 'string' ? error : error.message || 'An error occurred';
    return (
      <div className={`relative w-full h-full ${className}`}>
        <GraphError error={errorMessage} onRetry={handleRetry} />
      </div>
    );
  }

  // Show empty state
  if (!mermaidCode || nodes.length === 0) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <GraphEmpty message={emptyMessage} />
      </div>
    );
  }

  // Render graph with controls
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ cursor: panEnabled ? 'grab' : 'default' }}
    >
      {/* Main Graph */}
      <MermaidGraph
        graphId={graphId}
        mermaidCode={mermaidCode}
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        activeNodeId={activeNodeId}
        nodeStates={nodeStates}
        enableZoom={true}
        initialZoom={zoomLevel}
      />

      {/* Legend */}
      {showLegend && (
        <NodeLegend
          initiallyExpanded={false}
          showNodeTypes={true}
          showNodeStates={true}
        />
      )}

      {/* Controls */}
      {showControls && (
        <GraphControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFitToScreen}
          onTogglePan={handleTogglePan}
          zoomLevel={zoomLevel}
          panEnabled={panEnabled}
        />
      )}

      {/* Accessibility: Live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        aria-atomic="true"
      >
        {activeNodeId && `Selected node: ${activeNodeId}`}
      </div>
    </div>
  );
}

export default GraphContainer;
