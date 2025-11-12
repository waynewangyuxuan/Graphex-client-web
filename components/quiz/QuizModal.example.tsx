'use client';

/**
 * Quiz Modal Integration Example
 *
 * This example demonstrates how to integrate the quiz system into a graph view page.
 * It shows:
 * - Tracking node interactions
 * - Triggering quiz banner after 5 interactions
 * - Opening quiz modal
 * - Handling quiz completion
 * - Navigating to nodes from quiz results
 */

import * as React from 'react';
import { QuizTriggerBanner, QuizModal } from '@/components/quiz';

interface ExampleGraphViewProps {
  graphId: string;
}

export default function ExampleGraphView({ graphId }: ExampleGraphViewProps) {
  // Track which nodes user has interacted with
  const [interactedNodeIds, setInteractedNodeIds] = React.useState<Set<string>>(
    new Set()
  );

  // Quiz UI state
  const [showQuizBanner, setShowQuizBanner] = React.useState(false);
  const [isQuizOpen, setIsQuizOpen] = React.useState(false);
  const [hasDismissedBanner, setHasDismissedBanner] = React.useState(false);

  // Selected node for reading panel
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);

  // Show banner when 5 unique nodes interacted (and user hasn't dismissed it)
  React.useEffect(() => {
    if (interactedNodeIds.size >= 5 && !hasDismissedBanner && !showQuizBanner) {
      setShowQuizBanner(true);
    }
  }, [interactedNodeIds.size, hasDismissedBanner, showQuizBanner]);

  /**
   * Handle node click in graph
   * Tracks interaction and shows content in reading panel
   */
  const handleNodeClick = (nodeId: string) => {
    // Track interaction
    setInteractedNodeIds((prev) => new Set([...prev, nodeId]));

    // Show node content in reading panel
    setSelectedNodeId(nodeId);
  };

  /**
   * Handle "Start Quiz" button click
   */
  const handleStartQuiz = () => {
    setShowQuizBanner(false);
    setIsQuizOpen(true);
  };

  /**
   * Handle "Later" or dismiss button click
   */
  const handleDismissBanner = () => {
    setShowQuizBanner(false);
    setHasDismissedBanner(true);

    // Optional: Re-enable banner after some time or more interactions
    // setTimeout(() => setHasDismissedBanner(false), 5 * 60 * 1000); // 5 minutes
  };

  /**
   * Handle quiz completion
   * Could update node states based on quiz results
   */
  const handleQuizComplete = (results: any) => {
    console.log('Quiz completed:', results);

    // Optional: Mark nodes as mastered/needs-review based on results
    // This would require updating node states in your graph data
    /*
    results.answers.forEach((answer) => {
      if (answer.nodeId) {
        if (answer.isCorrect) {
          // Mark node as "mastered" in graph state
        } else {
          // Mark node as "needs-review" in graph state
        }
      }
    });
    */
  };

  /**
   * Handle "Review this concept" link click from quiz
   * Navigates to the relevant node in the graph
   */
  const handleViewNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsQuizOpen(false);

    // Optional: Scroll to node in graph, highlight it, etc.
    // This depends on your graph implementation
  };

  return (
    <div className="relative h-screen w-full">
      {/* Quiz trigger banner */}
      <QuizTriggerBanner
        isVisible={showQuizBanner}
        onStart={handleStartQuiz}
        onDismiss={handleDismissBanner}
        interactionCount={interactedNodeIds.size}
      />

      {/* Quiz modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        graphId={graphId}
        onComplete={handleQuizComplete}
        onViewNode={handleViewNode}
        questionCount={5}
        difficulty="medium"
      />

      {/* Main layout */}
      <div className="flex h-full">
        {/* Graph panel (left side) */}
        <div className="flex-1 border-r border-gray-200 bg-graph-canvas">
          <div className="h-full p-4">
            {/* Your graph component here */}
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="mb-4 text-xl font-semibold text-text-primary">
                  Graph View
                </h2>
                <p className="mb-4 text-sm text-text-secondary">
                  Interacted with {interactedNodeIds.size} nodes
                </p>
                <div className="space-y-2">
                  {/* Example nodes */}
                  {['node1', 'node2', 'node3', 'node4', 'node5', 'node6'].map(
                    (nodeId) => (
                      <button
                        key={nodeId}
                        onClick={() => handleNodeClick(nodeId)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          interactedNodeIds.has(nodeId)
                            ? 'bg-primary text-white'
                            : 'bg-white text-primary hover:bg-primary-50'
                        }`}
                      >
                        {nodeId.toUpperCase()}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading panel (right side) */}
        <div className="w-96 bg-chrome">
          <div className="h-full overflow-y-auto p-6">
            {selectedNodeId ? (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-text-primary">
                  {selectedNodeId.toUpperCase()}
                </h3>
                <p className="text-sm text-text-secondary">
                  Content for {selectedNodeId} would appear here...
                </p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-text-muted">
                  Click a node to view its content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Integration Notes:
 *
 * 1. Node Interaction Tracking:
 *    - Track node clicks/views in a Set to ensure uniqueness
 *    - Consider different types of interactions (click, read time, note creation)
 *
 * 2. Banner Timing:
 *    - Show after 5 nodes (per MVP requirements)
 *    - Don't re-show immediately after dismissal
 *    - Consider showing again after more interactions or time
 *
 * 3. Quiz Completion:
 *    - Update graph node visual states (mastered/needs-review)
 *    - Consider storing completion state in localStorage or backend
 *    - Show celebration for high scores
 *
 * 4. Navigation from Quiz:
 *    - Close quiz when user clicks "Review this concept"
 *    - Navigate to and highlight the relevant node
 *    - Consider auto-opening the reading panel
 *
 * 5. Accessibility:
 *    - Banner is non-blocking (user can continue working)
 *    - Quiz is keyboard navigable
 *    - Screen reader announcements for score/feedback
 *
 * 6. State Persistence:
 *    - Consider saving interaction count across page reloads
 *    - Track which quizzes have been completed
 *    - Store quiz scores for progress tracking
 */
