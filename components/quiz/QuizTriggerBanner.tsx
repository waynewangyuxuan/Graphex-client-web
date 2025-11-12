'use client';

import * as React from 'react';
import { X, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Quiz Trigger Banner Component
 *
 * Non-blocking notification that slides from top when user has interacted
 * with 5+ nodes. Prompts user to start a comprehension quiz.
 *
 * Design: Gentle notification with teal info styling, smooth slide animation.
 *
 * @example
 * <QuizTriggerBanner
 *   isVisible={interactedNodeIds.size >= 5}
 *   onStart={() => setIsQuizOpen(true)}
 *   onDismiss={() => setShowBanner(false)}
 *   interactionCount={interactedNodeIds.size}
 * />
 */

export interface QuizTriggerBannerProps {
  /**
   * Whether the banner is visible
   */
  isVisible: boolean;
  /**
   * Callback when user clicks "Start Quiz"
   */
  onStart: () => void;
  /**
   * Callback when user dismisses the banner
   */
  onDismiss: () => void;
  /**
   * Number of nodes user has interacted with
   */
  interactionCount: number;
}

export function QuizTriggerBanner({
  isVisible,
  onStart,
  onDismiss,
  interactionCount,
}: QuizTriggerBannerProps) {
  const [shouldRender, setShouldRender] = React.useState(isVisible);

  React.useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 top-0 z-40 transition-transform duration-400 ease-out',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="rounded-lg border-l-4 border-info bg-info/10 p-4 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            {/* Icon and message */}
            <div className="flex items-start gap-3">
              <Brain
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-info"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text-primary">
                  Ready to test your understanding?
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  You've explored {interactionCount} concepts. Take a quick quiz to
                  reinforce what you've learned.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onDismiss}
                aria-label="Dismiss quiz notification"
              >
                Later
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onStart}
                aria-label="Start comprehension quiz"
              >
                Start Quiz
              </Button>

              {/* Close button */}
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  'ml-2 rounded-sm p-1 text-text-secondary transition-colors',
                  'hover:bg-info/20 hover:text-text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2'
                )}
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
