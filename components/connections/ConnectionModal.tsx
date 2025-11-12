/**
 * ConnectionModal Component
 *
 * Implements the Pre-Explanation Retrieval flow (Feature 4):
 *
 * Two-step process:
 * 1. User writes hypothesis (minimum 50 chars) before seeing AI explanation
 * 2. After submission, show AI explanation with source text
 *
 * This prevents fluency illusion and provides 30% retention boost by
 * activating prior knowledge before revealing the answer.
 *
 * Design: Slide-up modal with backdrop blur, accessible keyboard navigation
 */

'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useExplainConnection, useToast } from '@/hooks';
import { ConnectionDetails } from './ConnectionDetails';
import { HypothesisInput } from './HypothesisInput';
import { AIExplanation } from './AIExplanation';

export interface ConnectionModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Close handler
   */
  onClose: () => void;
  /**
   * Graph ID (for potential future features)
   */
  graphId: string;
  /**
   * Source node ID
   */
  fromNodeId: string;
  /**
   * Destination node ID
   */
  toNodeId: string;
  /**
   * Source node title for display
   */
  fromNodeTitle: string;
  /**
   * Destination node title for display
   */
  toNodeTitle: string;
  /**
   * Relationship label (e.g., "leads to", "defines")
   */
  relationshipLabel?: string;
}

type Step = 'hypothesis' | 'explanation';

/**
 * ConnectionModal component
 *
 * @example
 * ```tsx
 * const [modalState, setModalState] = useState({
 *   isOpen: false,
 *   fromNodeId: '',
 *   toNodeId: '',
 *   fromNodeTitle: '',
 *   toNodeTitle: '',
 *   relationshipLabel: '',
 * });
 *
 * // Open modal when edge is clicked
 * const handleEdgeClick = (edge: GraphEdge) => {
 *   const fromNode = graph.nodes.find(n => n.id === edge.fromNodeId);
 *   const toNode = graph.nodes.find(n => n.id === edge.toNodeId);
 *
 *   setModalState({
 *     isOpen: true,
 *     fromNodeId: edge.fromNodeId,
 *     toNodeId: edge.toNodeId,
 *     fromNodeTitle: fromNode.title,
 *     toNodeTitle: toNode.title,
 *     relationshipLabel: edge.relationship,
 *   });
 * };
 *
 * <ConnectionModal
 *   {...modalState}
 *   graphId={graphId}
 *   onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
 * />
 * ```
 */
export function ConnectionModal({
  isOpen,
  onClose,
  graphId,
  fromNodeId,
  toNodeId,
  fromNodeTitle,
  toNodeTitle,
  relationshipLabel = 'relates to',
}: ConnectionModalProps) {
  const [step, setStep] = useState<Step>('hypothesis');
  const [hypothesis, setHypothesis] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const { toast } = useToast();

  // React Query mutation for getting explanation
  const explainMutation = useExplainConnection({
    onSuccess: (data) => {
      // Move to explanation step on success
      setStep('explanation');
      toast({
        title: 'Success',
        description: 'Explanation loaded successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load explanation. Please try again.',
        variant: 'error',
      });
    },
  });

  // Reset state when modal closes
  const handleClose = () => {
    // Small delay to allow exit animation
    setTimeout(() => {
      setStep('hypothesis');
      setHypothesis('');
      setShowValidationError(false);
      setShouldShake(false);
      explainMutation.reset();
    }, 300);
    onClose();
  };

  // Validate and submit hypothesis
  const handleSubmitHypothesis = () => {
    // Validate minimum character requirement
    if (hypothesis.length < 50) {
      setShowValidationError(true);
      setShouldShake(true);
      // Reset shake after animation completes
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    // Clear validation error
    setShowValidationError(false);

    // Submit to API with hypothesis
    explainMutation.mutate({
      fromNodeId,
      toNodeId,
      userHypothesis: hypothesis,
    });
  };

  // Keyboard shortcut: Enter to submit (when valid)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === 'Enter' &&
      (e.metaKey || e.ctrlKey) &&
      step === 'hypothesis' &&
      hypothesis.length >= 50
    ) {
      handleSubmitHypothesis();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <Dialog.Content
        animationStyle="slide-bottom"
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <Dialog.Header>
          <Dialog.Title>
            {step === 'hypothesis'
              ? 'Explain This Connection'
              : 'AI Explanation'}
          </Dialog.Title>
          <Dialog.Description>
            {step === 'hypothesis'
              ? 'Before seeing the AI explanation, write your hypothesis about why these concepts are connected.'
              : 'Here is how the AI understands this connection, along with supporting source text.'}
          </Dialog.Description>
        </Dialog.Header>

        {/* Body */}
        <Dialog.Body>
          <div className="space-y-6">
            {/* Connection details (always visible) */}
            <ConnectionDetails
              fromNodeTitle={fromNodeTitle}
              toNodeTitle={toNodeTitle}
              relationshipLabel={relationshipLabel}
            />

            {/* Step 1: Hypothesis Input */}
            {step === 'hypothesis' && (
              <div className="space-y-4">
                <HypothesisInput
                  value={hypothesis}
                  onChange={setHypothesis}
                  showError={showValidationError}
                  shouldShake={shouldShake}
                  disabled={explainMutation.isPending}
                />
              </div>
            )}

            {/* Step 2: AI Explanation */}
            {step === 'explanation' && explainMutation.isSuccess && (
              <div className="space-y-6">
                {/* Show locked hypothesis */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-text-secondary">
                    Your Hypothesis
                  </h4>
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                    <p className="font-sans text-sm text-text-primary italic">
                      {hypothesis}
                    </p>
                  </div>
                </div>

                {/* AI Explanation */}
                <AIExplanation
                  explanation={explainMutation.data.explanation}
                  sourceReferences={explainMutation.data.sourceReferences}
                />
              </div>
            )}
          </div>
        </Dialog.Body>

        {/* Footer */}
        <Dialog.Footer>
          {step === 'hypothesis' && (
            <>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitHypothesis}
                isLoading={explainMutation.isPending}
                disabled={hypothesis.length < 50 || explainMutation.isPending}
              >
                {explainMutation.isPending
                  ? 'Loading Explanation...'
                  : 'Submit & See Explanation'}
              </Button>
            </>
          )}

          {step === 'explanation' && (
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
