/**
 * SaveStatus Component
 *
 * Displays auto-save status indicator with smooth transitions.
 * Shows saving state, success state with checkmark, and error state with retry option.
 *
 * @example
 * ```tsx
 * <SaveStatus isSaving={isSaving} lastSaved={lastSaved} error={error} />
 * ```
 */

import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface SaveStatusProps {
  /**
   * Whether a save operation is in progress
   */
  isSaving: boolean;
  /**
   * Timestamp of last successful save
   */
  lastSaved: Date | null;
  /**
   * Error message if save failed
   */
  error?: string | null;
  /**
   * Callback to retry after error
   */
  onRetry?: () => void;
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Save status indicator component
 *
 * Displays current save state with appropriate icon and text.
 * Success state automatically fades out after 2 seconds.
 */
export function SaveStatus({
  isSaving,
  lastSaved,
  error,
  onRetry,
  className,
}: SaveStatusProps) {
  const [showSaved, setShowSaved] = useState(false);

  // Show "Saved" message for 2 seconds after successful save
  useEffect(() => {
    if (lastSaved && !isSaving && !error) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved, isSaving, error]);

  // Don't show anything if idle
  if (!isSaving && !showSaved && !error) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm transition-opacity duration-300',
        showSaved && 'animate-in fade-in-0 slide-in-from-top-2',
        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Saving state */}
      {isSaving && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden="true" />
          <span className="text-text-secondary">Saving...</span>
        </>
      )}

      {/* Success state */}
      {showSaved && !isSaving && !error && (
        <>
          <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          <span className="text-success">Saved</span>
        </>
      )}

      {/* Error state */}
      {error && !isSaving && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-error" aria-hidden="true" />
          <span className="text-error">Failed to save</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-1 text-xs underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
              aria-label="Retry save"
            >
              Retry
            </button>
          )}
        </>
      )}
    </div>
  );
}
