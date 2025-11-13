import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge Component
 *
 * Small status indicators with semantic color meanings.
 * Primarily used for node states and system feedback.
 *
 * @example
 * // Node state badges
 * <Badge variant="with-notes">3 Notes</Badge>
 * <Badge variant="mastered">Mastered</Badge>
 * <Badge variant="needs-review">Review</Badge>
 *
 * @example
 * // System feedback
 * <Badge variant="success">Uploaded</Badge>
 * <Badge variant="error">Failed</Badge>
 * <Badge variant="info">Processing</Badge>
 */

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Node state variants (from color system)
        'with-notes':
          'bg-state-with-notes/20 text-amber-900 border border-state-with-notes',
        mastered:
          'bg-state-mastered/20 text-green-900 border border-state-mastered',
        'needs-review':
          'bg-state-needs-review/20 text-red-900 border border-state-needs-review',
        // Node type variants
        root: 'bg-node-root/20 text-blue-900 border border-node-root',
        supporting:
          'bg-node-supporting/20 text-blue-800 border border-node-supporting',
        example: 'bg-node-example/20 text-cyan-900 border border-node-example',
        definition:
          'bg-node-definition/20 text-teal-900 border border-node-definition',
        question:
          'bg-node-question/20 text-orange-900 border border-node-question',
        // Semantic variants
        success: 'bg-success/20 text-green-900 border border-success',
        error: 'bg-error/20 text-red-900 border border-error',
        warning: 'bg-warning/20 text-amber-900 border border-warning',
        info: 'bg-info/20 text-blue-900 border border-info',
        // Neutral variant
        default:
          'bg-text-muted/20 text-text-primary border border-text-muted/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Optional icon to display before the text
   */
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {icon && <span className="mr-1 inline-flex">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
