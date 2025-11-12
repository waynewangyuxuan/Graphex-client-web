/**
 * ConnectionModal Example Usage
 *
 * Demonstrates how to integrate the ConnectionModal component
 * into a graph view page with edge click handling.
 */

'use client';

import { useState } from 'react';
import { ConnectionModal } from './ConnectionModal';
import type { GraphEdge, GraphNode } from '@/types/api.types';

/**
 * Example integration with graph view
 */
export function GraphViewWithConnectionModal() {
  // Modal state
  const [connectionModal, setConnectionModal] = useState({
    isOpen: false,
    fromNodeId: '',
    toNodeId: '',
    fromNodeTitle: '',
    toNodeTitle: '',
    relationshipLabel: '',
  });

  // Example graph data (would come from useGraph hook)
  const graphId = 'graph_example123';
  const exampleNodes: GraphNode[] = [
    {
      id: 'node_1',
      nodeKey: 'A',
      title: 'Active Learning',
      contentSnippet: 'Active learning involves...',
      documentRefs: [],
    },
    {
      id: 'node_2',
      nodeKey: 'B',
      title: 'Long-term Retention',
      contentSnippet: 'Long-term retention is...',
      documentRefs: [],
    },
  ];

  const exampleEdges: GraphEdge[] = [
    {
      id: 'edge_1',
      fromNodeId: 'node_1',
      toNodeId: 'node_2',
      relationship: 'leads to',
      aiExplanation: null,
    },
  ];

  /**
   * Handle edge click from graph visualization
   */
  const handleEdgeClick = (edgeId: string) => {
    // Find the clicked edge
    const edge = exampleEdges.find((e) => e.id === edgeId);
    if (!edge) return;

    // Find the connected nodes
    const fromNode = exampleNodes.find((n) => n.id === edge.fromNodeId);
    const toNode = exampleNodes.find((n) => n.id === edge.toNodeId);

    if (!fromNode || !toNode) return;

    // Open modal with connection details
    setConnectionModal({
      isOpen: true,
      fromNodeId: edge.fromNodeId,
      toNodeId: edge.toNodeId,
      fromNodeTitle: fromNode.title,
      toNodeTitle: toNode.title,
      relationshipLabel: edge.relationship,
    });
  };

  /**
   * Close modal and reset state
   */
  const handleCloseModal = () => {
    setConnectionModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  return (
    <div className="flex h-screen">
      {/* Graph Canvas */}
      <div className="flex-1 bg-canvas p-6">
        <h2 className="text-2xl font-bold mb-4">Knowledge Graph</h2>

        {/* Simplified edge representation */}
        <div className="space-y-4">
          {exampleEdges.map((edge) => {
            const fromNode = exampleNodes.find((n) => n.id === edge.fromNodeId);
            const toNode = exampleNodes.find((n) => n.id === edge.toNodeId);

            return (
              <button
                key={edge.id}
                onClick={() => handleEdgeClick(edge.id)}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="font-medium">{fromNode?.title}</span>
                <span className="text-primary text-sm">→ {edge.relationship}</span>
                <span className="font-medium">{toNode?.title}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-text-secondary">
          Click on a connection above to explain why these concepts are related.
        </p>
      </div>

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={connectionModal.isOpen}
        onClose={handleCloseModal}
        graphId={graphId}
        fromNodeId={connectionModal.fromNodeId}
        toNodeId={connectionModal.toNodeId}
        fromNodeTitle={connectionModal.fromNodeTitle}
        toNodeTitle={connectionModal.toNodeTitle}
        relationshipLabel={connectionModal.relationshipLabel}
      />
    </div>
  );
}

/**
 * Keyboard shortcut integration example
 */
export function useConnectionModalKeyboard(
  onOpenConnection: (fromNodeId: string, toNodeId: string) => void
) {
  // Example: Press 'E' to explain selected connection
  // Implementation would listen for keyboard events
  // and call onOpenConnection with selected edge data

  return {
    // Return cleanup function if needed
  };
}
