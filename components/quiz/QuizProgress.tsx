import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Quiz Progress Component
 *
 * Displays current question number and visual progress through the quiz.
 * Shows answered vs remaining questions with a clean progress bar.
 *
 * @example
 * <QuizProgress
 *   currentQuestion={2}
 *   totalQuestions={5}
 *   answeredCount={1}
 * />
 */

export interface QuizProgressProps {
  /**
   * Current question number (1-based)
   */
  currentQuestion: number;
  /**
   * Total number of questions
   */
  totalQuestions: number;
  /**
   * Number of questions answered
   */
  answeredCount?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function QuizProgress({
  currentQuestion,
  totalQuestions,
  answeredCount,
  className,
}: QuizProgressProps) {
  // Calculate progress percentage
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Text indicator */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          Question {currentQuestion} of {totalQuestions}
        </span>
        {answeredCount !== undefined && (
          <span className="text-xs text-text-muted">
            {answeredCount} answered
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-primary-100"
        role="progressbar"
        aria-valuenow={currentQuestion}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-label={`Question ${currentQuestion} of ${totalQuestions}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Dots indicator for small quiz counts */}
      {totalQuestions <= 10 && (
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const questionNum = i + 1;
            const isCurrent = questionNum === currentQuestion;
            const isPast = questionNum < currentQuestion;

            return (
              <div
                key={questionNum}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors duration-200',
                  isCurrent && 'bg-primary ring-2 ring-primary ring-offset-2',
                  isPast && 'bg-primary',
                  !isCurrent && !isPast && 'bg-primary-100'
                )}
                aria-hidden="true"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
