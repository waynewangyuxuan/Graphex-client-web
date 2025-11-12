import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Spinner/Loader Component
 *
 * A smooth rotating spinner for loading states. Respects prefers-reduced-motion
 * for accessibility.
 *
 * @example
 * // Small spinner
 * <Spinner size="sm" />
 *
 * @example
 * // In a button
 * <button disabled={isLoading}>
 *   {isLoading && <Spinner className="mr-2" />}
 *   Submit
 * </button>
 */

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
      },
      variant: {
        primary: 'text-primary',
        white: 'text-white',
        muted: 'text-text-muted',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessible label for screen readers
   * @default "Loading..."
   */
  srLabel?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, srLabel = 'Loading...', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(spinnerVariants({ size, variant }), className)}
        {...props}
      >
        <span className="sr-only">{srLabel}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };
