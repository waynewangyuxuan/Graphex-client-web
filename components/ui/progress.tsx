import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Progress Bar Component
 *
 * Displays upload and processing progress with smooth transitions.
 * Supports percentage display and optional stage labels.
 *
 * @example
 * // Basic progress bar
 * <Progress value={45} />
 *
 * @example
 * // With label and stages
 * <Progress
 *   value={65}
 *   label="Generating graph..."
 *   showPercentage
 * />
 *
 * @example
 * // Multi-stage progress
 * <Progress
 *   value={33}
 *   stages={['Parsing', 'Analyzing', 'Generating']}
 *   currentStage={0}
 * />
 */

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value: number;
  /**
   * Label to display above the progress bar
   */
  label?: string;
  /**
   * Show percentage value
   * @default false
   */
  showPercentage?: boolean;
  /**
   * Array of stage names for multi-step processes
   */
  stages?: string[];
  /**
   * Current stage index (0-based)
   */
  currentStage?: number;
  /**
   * Color variant
   * @default "primary"
   */
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      label,
      showPercentage,
      stages,
      currentStage,
      variant = 'primary',
      ...props
    },
    ref
  ) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), 100);

    // Variant colors
    const variantColors = {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Label and percentage */}
        {(label || showPercentage) && (
          <div className="mb-2 flex items-center justify-between">
            {label && (
              <span className="text-sm font-medium text-text-primary">
                {label}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-text-secondary">
                {clampedValue}%
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div
          className="relative h-2 w-full overflow-hidden rounded-full bg-primary-100"
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || 'Progress'}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              variantColors[variant]
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>

        {/* Stages */}
        {stages && stages.length > 0 && (
          <div className="mt-3 flex justify-between">
            {stages.map((stage, index) => {
              const isActive = currentStage === index;
              const isComplete =
                currentStage !== undefined && index < currentStage;

              return (
                <div
                  key={stage}
                  className={cn(
                    'flex flex-col items-center text-xs transition-colors',
                    isActive && 'font-medium text-primary',
                    isComplete && 'text-success',
                    !isActive && !isComplete && 'text-text-muted'
                  )}
                >
                  {/* Stage indicator dot */}
                  <div
                    className={cn(
                      'mb-1.5 h-2 w-2 rounded-full transition-colors',
                      isActive && 'bg-primary',
                      isComplete && 'bg-success',
                      !isActive && !isComplete && 'bg-text-muted/30'
                    )}
                  />
                  {/* Stage label */}
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
