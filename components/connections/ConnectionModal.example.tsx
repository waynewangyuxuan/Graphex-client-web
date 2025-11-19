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
      nodeType: 'concept',
      summary: 'Active learning is a teaching method that engages students.',
      documentRefs: null,
      position: { x: null, y: null },
      metadata: null,
    },
    {
      id: 'node_2',
      nodeKey: 'B',
      title: 'Long-term Retention',
      contentSnippet: 'Long-term retention is...',
      nodeType: 'concept',
      summary: 'Long-term retention refers to the ability to remember information over time.',
      documentRefs: null,
      position: { x: null, y: null },
      metadata: null,
    },
  ];

  const exampleEdges: GraphEdge[] = [
    {
      id: 'edge_1',
      from: 'node_1',
      to: 'node_2',
      fromNode: {
        nodeKey: 'A',
        title: 'Active Learning',
      },
      toNode: {
        nodeKey: 'B',
        title: 'Long-term Retention',
      },
      relationship: 'leads to',
      aiExplanation: null,
      strength: null,
      metadata: null,
    },
  ];

  /**
   * Handle edge click from graph visualization
   */
  const handleEdgeClick = (edgeId: string) => {
    // Find the clicked edge
    const edge = exampleEdges.find((e) => e.id === edgeId);
    if (!edge) return;

    // Edge now contains fromNode/toNode with title already
    // Open modal with connection details
    setConnectionModal({
      isOpen: true,
      fromNodeId: edge.from,
      toNodeId: edge.to,
      fromNodeTitle: edge.fromNode.title,
      toNodeTitle: edge.toNode.title,
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
            return (
              <button
                key={edge.id}
                onClick={() => handleEdgeClick(edge.id)}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="font-medium">{edge.fromNode.title}</span>
                <span className="text-primary text-sm">→ {edge.relationship}</span>
                <span className="font-medium">{edge.toNode.title}</span>
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
