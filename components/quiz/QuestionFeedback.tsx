'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Question Feedback Component
 *
 * Shows immediate feedback after answer submission:
 * - Correct: Green checkmark with brief explanation
 * - Incorrect: Red X with explanation and correct answer
 * - Optional link back to relevant node for review
 *
 * Design: Soft background colors with border accent, serif font for explanations.
 *
 * @example
 * <QuestionFeedback
 *   isCorrect={false}
 *   explanation="The mitochondria is the powerhouse of the cell."
 *   nodeId="node_123"
 *   onViewNode={(nodeId) => navigateToNode(nodeId)}
 * />
 */

export interface QuestionFeedbackProps {
  /**
   * Whether the answer was correct
   */
  isCorrect: boolean;
  /**
   * Explanation text (why correct or what the correct answer is)
   */
  explanation: string;
  /**
   * Optional node ID to link back to for review
   */
  nodeId?: string;
  /**
   * Callback to navigate to the relevant node
   */
  onViewNode?: (nodeId: string) => void;
}

export function QuestionFeedback({
  isCorrect,
  explanation,
  nodeId,
  onViewNode,
}: QuestionFeedbackProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-top-2 rounded-lg border-l-4 p-4 duration-300',
        isCorrect
          ? 'border-success bg-success/10'
          : 'border-error bg-error/10'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon and heading */}
      <div className="mb-2 flex items-start gap-3">
        {isCorrect ? (
          <CheckCircle2
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
            aria-hidden="true"
          />
        ) : (
          <XCircle
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-error"
            aria-hidden="true"
          />
        )}
        <div className="flex-1">
          <h3
            className={cn(
              'text-base font-semibold',
              isCorrect ? 'text-success' : 'text-error'
            )}
          >
            {isCorrect ? 'Correct!' : 'Not quite'}
          </h3>
        </div>
      </div>

      {/* Explanation */}
      <p className="mb-3 pl-8 font-serif text-sm leading-relaxed text-text-primary">
        {explanation}
      </p>

      {/* Link to node for review */}
      {!isCorrect && nodeId && onViewNode && (
        <div className="pl-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewNode(nodeId)}
            rightIcon={<ExternalLink className="h-4 w-4" />}
            className="text-text-secondary hover:text-text-primary"
          >
            Review this concept
          </Button>
        </div>
      )}
    </div>
  );
}
