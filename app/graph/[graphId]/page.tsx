/**
 * Graph View Page
 *
 * Main application interface showing graph and reading panel side-by-side.
 * Implements Feature 2: Integrated Reading Interface.
 *
 * Features:
 * - Split view: Graph (60%) | Reading Panel (40%)
 * - Click node → jump to relevant section in reading panel
 * - Highlight corresponding passage in document
 * - Responsive layout (stacks on smaller screens)
 * - Loading and error states
 */

'use client';

import { useState } from 'react';
import { useGraph } from '@/hooks/useGraph';
import { GraphContainer } from '@/components/graph';
import { ReadingPanel } from '@/components/reading';
import type { GraphNode } from '@/types/api.types';

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  params: {
    graphId: string;
  };
}

// ============================================================================
// Component
// ============================================================================

/**
 * GraphViewPage - Main graph viewer with integrated reading panel
 *
 * This is the core application interface where users interact with
 * the knowledge graph and read the source document.
 */
export default function GraphViewPage({ params }: PageProps) {
  const { graphId } = params;

  // Fetch graph data
  const { data: graph, isLoading, error } = useGraph(graphId);

  // UI state
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [highlightRange, setHighlightRange] = useState<{
    startOffset: number;
    endOffset: number;
  } | null>(null);

  /**
   * Handle node click in graph
   * Updates active node and sets highlight range from documentRefs
   */
  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(nodeId);

    // Find node's document reference
    const node = graph?.nodes.find((n) => n.id === nodeId);
    if (node?.documentRefs?.[0]) {
      const ref = node.documentRefs[0];
      setHighlightRange({
        startOffset: ref.start,
        endOffset: ref.end,
      });
    } else {
      // Clear highlight if node has no refs
      setHighlightRange(null);
    }
  };

  /**
   * Handle edge click in graph
   * For now, just log. Future: open connection modal
   */
  const handleEdgeClick = (edgeId: string) => {
    console.log('Edge clicked:', edgeId);
    // TODO: Feature 4 - Pre-explanation retrieval modal
  };

  // Loading state - show skeleton for both panels
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="h-16 bg-chrome border-b border-gray-200 flex items-center px-6">
          <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
        </header>

        {/* Split View Skeleton */}
        <div className="flex-1 flex overflow-hidden">
          {/* Graph Skeleton (60%) */}
          <div className="w-3/5 border-r border-gray-200 bg-canvas">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-text-secondary">Loading graph...</p>
              </div>
            </div>
          </div>

          {/* Reading Panel Skeleton (40%) */}
          <div className="w-2/5 bg-chrome">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-text-secondary">Loading document...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <svg
            className="w-16 h-16 text-error mx-auto mb-4"
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
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Failed to Load Graph
          </h1>
          <p className="text-text-secondary mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No graph found
  if (!graph) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <svg
            className="w-16 h-16 text-text-muted mx-auto mb-4"
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
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Graph Not Found
          </h1>
          <p className="text-text-secondary mb-6">
            The requested graph does not exist or has been deleted.
          </p>
          <a
            href="/"
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium inline-block"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Main view - split layout
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header
        className="h-16 bg-chrome border-b border-gray-200 flex items-center justify-between px-6"
        role="banner"
      >
        {/* Left: Logo/Title */}
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-primary hover:text-primary-600 transition-colors"
            aria-label="Go home"
          >
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </a>
          <h1 className="text-xl font-semibold text-text-primary">
            Knowledge Graph
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Help button */}
          <button
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Help"
            title="Help"
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Settings button */}
          <button
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
            title="Settings"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Graph Canvas (60% width) */}
        <div
          className="w-3/5 border-r border-gray-200"
          role="region"
          aria-label="Knowledge graph visualization"
        >
          <GraphContainer
            graphId={graph.id}
            mermaidCode={graph.mermaidCode}
            nodes={graph.nodes}
            edges={graph.edges}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            activeNodeId={activeNodeId}
            showLegend={true}
            showControls={true}
          />
        </div>

        {/* Right: Reading Panel (40% width) */}
        <div
          className="w-2/5"
          role="region"
          aria-label="Document reading panel"
        >
          <ReadingPanel
            documentId={graph.documentId}
            activeNodeId={activeNodeId}
            highlightRange={highlightRange}
          />
        </div>
      </div>

      {/* Keyboard shortcuts hint (optional) */}
      <div
        className="sr-only"
        role="note"
        aria-label="Keyboard shortcuts"
      >
        Press Tab to navigate between elements. Press Enter or Space to interact
        with nodes. Press Escape to close modals.
      </div>
    </div>
  );
}
