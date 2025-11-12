/**
 * NoteContent Component
 *
 * Textarea component for note-taking with auto-resize, character counter,
 * and proper validation feedback.
 *
 * @example
 * ```tsx
 * <NoteContent
 *   value={content}
 *   onChange={setContent}
 *   maxLength={2000}
 *   placeholder="Write your notes here..."
 *   error={errors.content?.message}
 * />
 * ```
 */

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface NoteContentProps {
  /**
   * Current content value
   */
  value: string;
  /**
   * Content change handler
   */
  onChange: (value: string) => void;
  /**
   * Maximum character length
   * @default 2000
   */
  maxLength?: number;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Additional class names
   */
  className?: string;
  /**
   * Automatically focus on mount
   */
  autoFocus?: boolean;
}

/**
 * Note content editor with character counting
 *
 * Provides a textarea with auto-resize, character counter,
 * and validation feedback for note-taking.
 */
export function NoteContent({
  value,
  onChange,
  maxLength = 2000,
  placeholder = 'Write your notes here... Summarize key concepts in your own words.',
  error,
  disabled,
  className,
  autoFocus,
}: NoteContentProps) {
  const characterCount = value.length;
  const isApproachingLimit = characterCount > maxLength * 0.9;
  const isAtLimit = characterCount >= maxLength;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Textarea */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        autoFocus={autoFocus}
        autoResize
        error={error}
        className={cn(
          'font-sans text-base leading-relaxed min-h-[200px]',
          'placeholder:text-text-muted/70'
        )}
        aria-label="Note content"
      />

      {/* Character counter */}
      <div className="flex items-center justify-between">
        {/* Helper text */}
        <p className="text-xs text-text-muted">
          Use your own words to reinforce understanding
        </p>

        {/* Character count */}
        <p
          className={cn(
            'text-xs transition-colors',
            isAtLimit && 'text-error font-medium',
            isApproachingLimit && !isAtLimit && 'text-warning',
            !isApproachingLimit && 'text-text-muted'
          )}
          aria-live="polite"
          aria-label={`${characterCount} of ${maxLength} characters used`}
        >
          {characterCount} / {maxLength}
        </p>
      </div>

      {/* Word count (optional, shown when approaching limit) */}
      {isApproachingLimit && (
        <p className="text-xs text-text-secondary">
          Approaching character limit. Consider summarizing further.
        </p>
      )}
    </div>
  );
}
