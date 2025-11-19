/**
 * Graph View Page
 *
 * Main application interface showing graph and reading panel side-by-side.
 * Implements Features 2, 3, 4, and 5:
 * - Feature 2: Integrated Reading Interface (graph + reading panel sync)
 * - Feature 3: Note-taking on nodes (NoteModal)
 * - Feature 4: Pre-explanation retrieval on edges (ConnectionModal)
 * - Feature 5: Comprehension quiz (QuizModal + QuizTriggerBanner)
 *
 * Features:
 * - Split view: Graph (60%) | Reading Panel (40%)
 * - Click node → jump to relevant section in reading panel
 * - Highlight corresponding passage in document
 * - Node click → open NoteModal for note-taking
 * - Edge click → open ConnectionModal for connection explanation
 * - Track node interactions → trigger quiz banner after 5+ nodes
 * - Responsive layout (stacks on smaller screens)
 * - Loading and error states
 */

'use client';

import { useState, useCallback, use } from 'react';
import { useGraph } from '@/hooks/useGraph';
import { GraphContainer } from '@/components/graph';
import { ReadingPanel } from '@/components/reading';
import { NotePanel } from '@/components/notes';
import { ConnectionModal } from '@/components/connections';
import { QuizModal, QuizTriggerBanner } from '@/components/quiz';
import type { Graph, GraphNode, GraphEdge } from '@/types/api.types';

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  params: Promise<{
    graphId: string;
  }>;
}

interface NoteModalState {
  isOpen: boolean;
  nodeId: string | null;
  nodeTitle: string | null;
}

interface ConnectionModalState {
  isOpen: boolean;
  fromNodeId: string | null;
  toNodeId: string | null;
  fromNodeTitle: string | null;
  toNodeTitle: string | null;
  relationshipLabel: string | null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * GraphViewPage - Main graph viewer with integrated reading panel
 *
 * This is the core application interface where users interact with
 * the knowledge graph and read the source document.
 *
 * Integrates all modal features:
 * - NoteModal for node note-taking
 * - ConnectionModal for edge explanations
 * - QuizModal for comprehension testing
 * - QuizTriggerBanner for quiz promotion
 */
export default function GraphViewPage({ params }: PageProps) {
  // Unwrap params Promise (Next.js 15+ requirement)
  const { graphId } = use(params);

  console.log('[GraphViewPage] Rendering with graphId:', graphId);

  // Fetch graph data
  const { data: graph, isLoading, error } = useGraph(graphId) as {
    data: Graph | undefined;
    isLoading: boolean;
    error: any;
  };

  console.log('[GraphViewPage] Query state:', {
    graphId,
    isLoading,
    hasGraph: !!graph,
    hasError: !!error,
    errorMessage: error?.message
  });

  // Debug: Log first node's document reference structure
  if (graph?.nodes?.[0]) {
    console.log('[GraphViewPage] First node structure sample:', {
      id: graph.nodes[0].id,
      title: graph.nodes[0].title,
      hasDocumentRefs: !!graph.nodes[0].documentRefs,
      documentRefs: graph.nodes[0].documentRefs,
      hasLegacyRefs: !!graph.nodes[0].legacyDocumentRefs,
      legacyDocumentRefs: graph.nodes[0].legacyDocumentRefs,
    });
  }

  // Reading panel state
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Legacy: character-based highlighting (for text documents)
  const [highlightRange, setHighlightRange] = useState<{
    startOffset: number;
    endOffset: number;
  } | null>(null);

  // New: coordinate-based highlighting (for PDF documents)
  const [highlightReferences, setHighlightReferences] = useState<
    import('@/types/api.types').NodeDocumentReference[] | null
  >(null);

  // Modal states
  const [noteModalState, setNoteModalState] = useState<NoteModalState>({
    isOpen: false,
    nodeId: null,
    nodeTitle: null,
  });

  const [connectionModalState, setConnectionModalState] =
    useState<ConnectionModalState>({
      isOpen: false,
      fromNodeId: null,
      toNodeId: null,
      fromNodeTitle: null,
      toNodeTitle: null,
      relationshipLabel: null,
    });

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Quiz trigger state
  const [interactedNodeIds, setInteractedNodeIds] = useState<Set<string>>(
    new Set()
  );
  const [showQuizBanner, setShowQuizBanner] = useState(false);
  const [hasTriggeredBanner, setHasTriggeredBanner] = useState(false);

  /**
   * Handle node click in graph
   * - Updates active node and highlight range for reading panel sync
   * - Shows note panel in bottom-left corner
   * - Tracks interactions for quiz trigger
   * - Supports both legacy (character-based) and new (coordinate-based) references
   */
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      console.log('[GraphViewPage] Node clicked:', nodeId);

      // Update reading panel state
      setActiveNodeId(nodeId);

      // Find node's document reference
      const node = graph?.nodes.find((n) => n.id === nodeId);
      console.log('[GraphViewPage] Node data:', {
        nodeId,
        hasNode: !!node,
        hasDocumentRefs: !!node?.documentRefs,
        hasLegacyRefs: !!node?.legacyDocumentRefs,
        documentRefs: node?.documentRefs,
        legacyDocumentRefs: node?.legacyDocumentRefs,
      });

      if (node?.documentRefs?.references) {
        // New format: coordinate-based references (for PDFs)
        console.log('[GraphViewPage] Setting coordinate-based references:', node.documentRefs.references);
        setHighlightReferences(node.documentRefs.references);
        setHighlightRange(null); // Clear legacy highlight
      } else if (node?.legacyDocumentRefs?.[0]) {
        // Legacy format: character-based references (for text documents)
        const ref = node.legacyDocumentRefs[0];
        console.log('[GraphViewPage] Setting legacy character-based reference:', ref);
        setHighlightRange({
          startOffset: ref.start,
          endOffset: ref.end,
        });
        setHighlightReferences(null); // Clear new highlight
      } else {
        // Clear both highlights if node has no refs
        console.log('[GraphViewPage] No references found, clearing highlights');
        setHighlightRange(null);
        setHighlightReferences(null);
      }

      // Update note panel state (now shows persistently in bottom-left)
      setNoteModalState({
        isOpen: true, // Keeps panel visible
        nodeId,
        nodeTitle: node?.title || null,
      });

      // Track interaction for quiz trigger
      setInteractedNodeIds((prev) => {
        const updated = new Set(prev);
        updated.add(nodeId);

        // Trigger banner when 5+ unique nodes clicked (only once)
        if (updated.size >= 5 && !hasTriggeredBanner) {
          setShowQuizBanner(true);
          setHasTriggeredBanner(true);
        }

        return updated;
      });
    },
    [graph?.nodes, hasTriggeredBanner]
  );

  /**
   * Handle edge click in graph
   * Opens ConnectionModal with edge details
   */
  const handleEdgeClick = useCallback(
    (edgeId: string) => {
      if (!graph) return;

      // Find the edge
      const edge = graph.edges.find((e) => e.id === edgeId);
      if (!edge) return;

      // Edge now contains fromNode/toNode with title already
      // Open ConnectionModal
      setConnectionModalState({
        isOpen: true,
        fromNodeId: edge.from,
        toNodeId: edge.to,
        fromNodeTitle: edge.fromNode.title,
        toNodeTitle: edge.toNode.title,
        relationshipLabel: edge.relationship,
      });
    },
    [graph]
  );

  /**
   * Handle quiz trigger banner actions
   */
  const handleStartQuiz = useCallback(() => {
    setShowQuizBanner(false);
    setIsQuizModalOpen(true);
  }, []);

  const handleDismissBanner = useCallback(() => {
    setShowQuizBanner(false);
  }, []);

  /**
   * Close modal handlers
   */
  const handleCloseNoteModal = useCallback(() => {
    setNoteModalState({
      isOpen: false,
      nodeId: null,
      nodeTitle: null,
    });
  }, []);

  const handleCloseConnectionModal = useCallback(() => {
    setConnectionModalState({
      isOpen: false,
      fromNodeId: null,
      toNodeId: null,
      fromNodeTitle: null,
      toNodeTitle: null,
      relationshipLabel: null,
    });
  }, []);

  const handleCloseQuizModal = useCallback(() => {
    setIsQuizModalOpen(false);
  }, []);

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
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Go home"
          >
            <img
              src="/logo.png"
              alt="Graphex Logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
              Graphex
            </h1>
          </a>
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
            documentId={graph.document.id}
            activeNodeId={activeNodeId}
            highlightRange={highlightRange}
            highlightReferences={highlightReferences}
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

      {/* Quiz Trigger Banner - Fixed at top when triggered */}
      <QuizTriggerBanner
        isVisible={showQuizBanner}
        onStart={handleStartQuiz}
        onDismiss={handleDismissBanner}
        interactionCount={interactedNodeIds.size}
      />

      {/* Feature 3: Note Panel - Persistent panel in bottom-left corner */}
      <NotePanel
        isVisible={noteModalState.isOpen}
        onClose={handleCloseNoteModal}
        graphId={graphId}
        nodeId={noteModalState.nodeId}
        nodeTitle={noteModalState.nodeTitle}
      />

      {/* Feature 4: Connection Modal - Opens when edge is clicked */}
      {connectionModalState.fromNodeId && connectionModalState.toNodeId && (
        <ConnectionModal
          isOpen={connectionModalState.isOpen}
          onClose={handleCloseConnectionModal}
          graphId={graphId}
          fromNodeId={connectionModalState.fromNodeId}
          toNodeId={connectionModalState.toNodeId}
          fromNodeTitle={connectionModalState.fromNodeTitle || ''}
          toNodeTitle={connectionModalState.toNodeTitle || ''}
          relationshipLabel={connectionModalState.relationshipLabel || undefined}
        />
      )}

      {/* Feature 5: Quiz Modal - Opens when user starts quiz */}
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={handleCloseQuizModal}
        graphId={graphId}
        questionCount={5}
        difficulty="medium"
        onComplete={(results) => {
          console.log('Quiz completed:', results);
        }}
        onViewNode={(nodeId) => {
          // Close quiz and highlight the node
          setIsQuizModalOpen(false);
          handleNodeClick(nodeId);
        }}
      />
    </div>
  );
}
