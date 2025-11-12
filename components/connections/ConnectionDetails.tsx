/**
 * ConnectionDetails Component
 *
 * Displays the connection context at the top of the modal:
 * - From node → To node with relationship label
 * - Visual representation with arrow
 * - Color-coded by relationship type
 *
 * Used in ConnectionModal to show which nodes are being explained.
 */

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConnectionDetailsProps {
  /**
   * Title of the source node
   */
  fromNodeTitle: string;
  /**
   * Title of the destination node
   */
  toNodeTitle: string;
  /**
   * Relationship label (e.g., "leads to", "defines", "relates to")
   */
  relationshipLabel?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Get color classes based on relationship type
 * Maps to edge color system from UIUX.md
 */
function getRelationshipColor(relationship: string): string {
  const normalized = relationship.toLowerCase();

  if (normalized.includes('leads to') || normalized.includes('causes')) {
    return 'text-edge-causal'; // Blue
  }
  if (normalized.includes('defines') || normalized.includes('is a')) {
    return 'text-edge-definitional'; // Purple
  }
  if (normalized.includes('such as') || normalized.includes('example')) {
    return 'text-edge-example'; // Cyan
  }
  if (normalized.includes('contrasts') || normalized.includes('differs')) {
    return 'text-edge-contrast'; // Orange
  }

  // Default: related/general
  return 'text-edge-related'; // Gray
}

/**
 * ConnectionDetails component
 *
 * @example
 * ```tsx
 * <ConnectionDetails
 *   fromNodeTitle="Active Learning"
 *   toNodeTitle="Retention"
 *   relationshipLabel="leads to"
 * />
 * ```
 */
export function ConnectionDetails({
  fromNodeTitle,
  toNodeTitle,
  relationshipLabel = 'relates to',
  className,
}: ConnectionDetailsProps) {
  const relationshipColor = getRelationshipColor(relationshipLabel);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg bg-primary-50 p-4',
        'border-l-4 border-primary',
        className
      )}
      role="region"
      aria-label="Connection details"
    >
      {/* From node */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">
          From
        </p>
        <p className="text-base font-semibold text-text-primary truncate">
          {fromNodeTitle}
        </p>
      </div>

      {/* Relationship with arrow */}
      <div className="flex flex-col items-center gap-1 px-3">
        <ArrowRight
          className={cn('h-6 w-6', relationshipColor)}
          aria-hidden="true"
        />
        <p
          className={cn(
            'text-xs font-medium whitespace-nowrap',
            relationshipColor
          )}
        >
          {relationshipLabel}
        </p>
      </div>

      {/* To node */}
      <div className="flex-1 min-w-0 text-right">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">
          To
        </p>
        <p className="text-base font-semibold text-text-primary truncate">
          {toNodeTitle}
        </p>
      </div>
    </div>
  );
}
