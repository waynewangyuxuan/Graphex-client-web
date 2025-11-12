/**
 * AIExplanation Component
 *
 * Displays the AI-generated explanation for a connection with:
 * - Smooth fade-in reveal animation
 * - AI indicator icon
 * - Relevant source text passages
 * - Proper formatting for readability
 *
 * Used in ConnectionModal after user submits hypothesis.
 */

import { Bot, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentReference } from '@/types/api.types';

export interface AIExplanationProps {
  /**
   * AI-generated explanation text
   */
  explanation: string;
  /**
   * Source text passages that support the explanation
   */
  sourceReferences?: DocumentReference[];
  /**
   * Show with fade-in animation
   * @default true
   */
  animate?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * AIExplanation component
 *
 * @example
 * ```tsx
 * <AIExplanation
 *   explanation="These concepts are connected because active learning strategies directly improve long-term retention..."
 *   sourceReferences={[
 *     {
 *       start: 145,
 *       end: 289,
 *       text: "Research shows that active learning techniques..."
 *     }
 *   ]}
 * />
 * ```
 */
export function AIExplanation({
  explanation,
  sourceReferences = [],
  animate = true,
  className,
}: AIExplanationProps) {
  return (
    <div
      className={cn(
        'space-y-4',
        animate && 'animate-in fade-in-50 duration-300',
        className
      )}
      role="article"
      aria-label="AI explanation"
    >
      {/* AI Explanation Section */}
      <div className="space-y-3">
        {/* Header with AI icon */}
        <div className="flex items-center gap-2">
          <Bot
            className="h-5 w-5 text-primary"
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold text-text-primary">
            AI Explanation
          </h3>
        </div>

        {/* Explanation text */}
        <div className="rounded-lg bg-primary-50 border-l-4 border-primary p-4">
          <p className="font-serif text-base leading-relaxed text-text-primary">
            {explanation}
          </p>
        </div>
      </div>

      {/* Source References Section */}
      {sourceReferences.length > 0 && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Quote
              className="h-4 w-4 text-text-secondary"
              aria-hidden="true"
            />
            <h4 className="text-sm font-semibold text-text-secondary">
              Relevant Source Text
            </h4>
          </div>

          {/* Source passages */}
          <div className="space-y-3">
            {sourceReferences.map((ref, index) => (
              <blockquote
                key={`${ref.start}-${ref.end}`}
                className={cn(
                  'border-l-4 border-text-muted/30 pl-4 py-2',
                  'bg-canvas/50 rounded-r-lg'
                )}
              >
                <p className="font-serif text-sm leading-relaxed text-text-secondary italic">
                  {ref.text}
                </p>
                <p className="mt-2 text-xs text-text-muted">
                  Source position: {ref.start}–{ref.end}
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Helper text for next step */}
      <div className="pt-2 border-t border-text-muted/20">
        <p className="text-sm text-text-secondary">
          Now that you've seen the AI's explanation, take a moment to reflect on
          how it relates to your initial hypothesis.
        </p>
      </div>
    </div>
  );
}
