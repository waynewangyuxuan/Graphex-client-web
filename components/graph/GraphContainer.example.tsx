/**
 * GraphContainer Usage Examples
 *
 * This file demonstrates common usage patterns for the GraphContainer component.
 * Reference these examples when implementing graph visualization features.
 */

'use client';

import { useState, useMemo } from 'react';
import { GraphContainer } from './GraphContainer';
import type { NodeState } from '@/lib/graph-utils';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

/**
 * Simplest possible implementation
 * Just display a graph with click handlers
 */
export function BasicGraphExample() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // In real app, this would come from useGraph hook
  const mockGraph = {
    id: 'graph-123',
    mermaidCode: `
      graph TD
        A[Neural Networks] --> B[Deep Learning]
        A --> C[Backpropagation]
        B --> D[CNNs]
        B --> E[RNNs]
    `,
    nodes: [
      { id: 'A', nodeKey: 'A', title: 'Neural Networks', contentSnippet: '...', documentRefs: [] },
      { id: 'B', nodeKey: 'B', title: 'Deep Learning', contentSnippet: '...', documentRefs: [] },
      { id: 'C', nodeKey: 'C', title: 'Backpropagation', contentSnippet: '...', documentRefs: [] },
      { id: 'D', nodeKey: 'D', title: 'CNNs', contentSnippet: '...', documentRefs: [] },
      { id: 'E', nodeKey: 'E', title: 'RNNs', contentSnippet: '...', documentRefs: [] },
    ],
    edges: [],
  };

  return (
    <div className="h-screen">
      <GraphContainer
        graphId={mockGraph.id}
        mermaidCode={mockGraph.mermaidCode}
        nodes={mockGraph.nodes}
        edges={mockGraph.edges}
        onNodeClick={setActiveNodeId}
        activeNodeId={activeNodeId}
      />
    </div>
  );
}

// ============================================================================
// Example 2: With Node States (Notes, Mastery)
// ============================================================================

/**
 * Advanced example showing node states
 * Integrates with notes and quiz results
 */
export function GraphWithStatesExample() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Mock data - in real app, comes from useNotes hook and quiz results
  const notes = {
    'A': 'Neural networks are computing systems inspired by biological neural networks',
    'C': 'Algorithm for calculating gradients',
  };

  const masteredNodes = new Set(['B', 'D']);
  const reviewNodes = new Set(['E']);

  // Build node states dynamically
  const nodeStates: Record<string, NodeState> = useMemo(() => {
    const states: Record<string, NodeState> = {};

    // Mark nodes with notes
    Object.keys(notes).forEach((nodeId) => {
      states[nodeId] = { ...states[nodeId], hasNotes: true };
    });

    // Mark mastered nodes
    masteredNodes.forEach((nodeId) => {
      states[nodeId] = { ...states[nodeId], isMastered: true };
    });

    // Mark nodes needing review
    reviewNodes.forEach((nodeId) => {
      states[nodeId] = { ...states[nodeId], needsReview: true };
    });

    return states;
  }, [notes, masteredNodes, reviewNodes]);

  return (
    <div className="h-screen">
      <GraphContainer
        graphId="graph-123"
        mermaidCode="graph TD; A-->B; A-->C; B-->D; B-->E;"
        nodes={[/* nodes */]}
        edges={[/* edges */]}
        onNodeClick={setActiveNodeId}
        activeNodeId={activeNodeId}
        nodeStates={nodeStates}
      />
    </div>
  );
}

// ============================================================================
// Example 3: Loading/Error States
// ============================================================================

/**
 * Demonstrates proper loading and error handling
 */
export function GraphWithLoadingExample({ graphId }: { graphId: string }) {
  // In real app, use useGraph hook
  const isLoading = false;
  const error = null;
  const graph = null;

  if (isLoading) {
    return (
      <GraphContainer
        graphId={graphId}
        mermaidCode=""
        nodes={[]}
        edges={[]}
        isLoading={true}
      />
    );
  }

  if (error) {
    return (
      <GraphContainer
        graphId={graphId}
        mermaidCode=""
        nodes={[]}
        edges={[]}
        error={error}
      />
    );
  }

  if (!graph) {
    return (
      <GraphContainer
        graphId={graphId}
        mermaidCode=""
        nodes={[]}
        edges={[]}
        emptyMessage="No graph available. Upload a document to get started."
      />
    );
  }

  return (
    <GraphContainer
      graphId={graph.id}
      mermaidCode={graph.mermaidCode}
      nodes={graph.nodes}
      edges={graph.edges}
    />
  );
}

// ============================================================================
// Example 4: Synchronized with Reading Panel
// ============================================================================

/**
 * Graph synchronized with reading panel
 * Clicking node scrolls reading panel to relevant section
 */
export function GraphWithReadingPanelExample() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(nodeId);

    // Scroll reading panel to node's content
    const element = document.getElementById(`content-${nodeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Graph - 60% width */}
      <div className="w-3/5">
        <GraphContainer
          graphId="graph-123"
          mermaidCode="graph TD; A-->B;"
          nodes={[/* nodes */]}
          edges={[/* edges */]}
          onNodeClick={handleNodeClick}
          activeNodeId={activeNodeId}
        />
      </div>

      {/* Reading Panel - 40% width */}
      <div className="w-2/5 overflow-y-auto bg-chrome p-8">
        <div id="content-A">
          <h2>Neural Networks</h2>
          <p>Content about neural networks...</p>
        </div>
        <div id="content-B">
          <h2>Deep Learning</h2>
          <p>Content about deep learning...</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Quiz Trigger After 5 Interactions
// ============================================================================

/**
 * Track node interactions and trigger quiz
 * Demonstrates Feature 5 from MVP
 */
export function GraphWithQuizTriggerExample() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [interactedNodeIds, setInteractedNodeIds] = useState<Set<string>>(new Set());
  const [showQuizBanner, setShowQuizBanner] = useState(false);

  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(nodeId);

    // Track interaction
    const updated = new Set(interactedNodeIds);
    updated.add(nodeId);
    setInteractedNodeIds(updated);

    // Trigger quiz after 5 unique node interactions
    if (updated.size >= 5 && !showQuizBanner) {
      setShowQuizBanner(true);
    }
  };

  return (
    <div className="h-screen relative">
      <GraphContainer
        graphId="graph-123"
        mermaidCode="graph TD; A-->B-->C-->D-->E-->F;"
        nodes={[/* 6+ nodes */]}
        edges={[/* edges */]}
        onNodeClick={handleNodeClick}
        activeNodeId={activeNodeId}
      />

      {/* Quiz Trigger Banner */}
      {showQuizBanner && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-white p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="font-semibold">Ready to test your understanding?</p>
            <p className="text-sm opacity-90">You've explored {interactedNodeIds.size} concepts</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuizBanner(false)}
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
            >
              Later
            </button>
            <button
              onClick={() => {/* Navigate to quiz */}}
              className="px-4 py-2 bg-white text-primary rounded hover:bg-primary-50 transition-colors font-medium"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 6: Custom Controls Position
// ============================================================================

/**
 * Disable default controls and add custom ones
 */
export function GraphWithCustomControlsExample() {
  return (
    <div className="h-screen">
      <GraphContainer
        graphId="graph-123"
        mermaidCode="graph TD; A-->B;"
        nodes={[/* nodes */]}
        edges={[/* edges */]}
        showControls={false}  // Disable default controls
        showLegend={false}    // Disable default legend
      />

      {/* Custom UI overlay */}
      <div className="absolute top-4 left-4">
        <button className="bg-primary text-white px-4 py-2 rounded">
          Custom Action
        </button>
      </div>
    </div>
  );
}
