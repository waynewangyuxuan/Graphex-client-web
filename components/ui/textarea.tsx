import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea Component
 *
 * A controlled textarea input with auto-resize, error states, and character counting.
 * Follows the design system with proper focus states and accessibility.
 *
 * @example
 * // Basic textarea
 * <Textarea placeholder="Enter your notes..." />
 *
 * @example
 * // With auto-resize and character counter
 * <Textarea
 *   label="Notes"
 *   autoResize
 *   maxLength={500}
 *   showCharacterCount
 * />
 *
 * @example
 * // With error
 * <Textarea
 *   label="Description"
 *   error="Description is required"
 * />
 */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text displayed above the textarea
   */
  label?: string;
  /**
   * Error message to display below textarea
   */
  error?: string;
  /**
   * Helper text displayed below textarea (when no error)
   */
  helperText?: string;
  /**
   * Container class name (for spacing/positioning)
   */
  containerClassName?: string;
  /**
   * Automatically resize height based on content
   */
  autoResize?: boolean;
  /**
   * Show character counter (requires maxLength prop)
   */
  showCharacterCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      containerClassName,
      id,
      disabled,
      autoResize,
      showCharacterCount,
      maxLength,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    // Generate ID for accessibility if not provided
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const counterId = `${inputId}-counter`;

    // Local ref for auto-resize functionality
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [characterCount, setCharacterCount] = React.useState(0);

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Auto-resize effect
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set height to scrollHeight
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, defaultValue, autoResize]);

    // Character count effect
    React.useEffect(() => {
      if (showCharacterCount && textareaRef.current) {
        setCharacterCount(textareaRef.current.value.length);
      }
    }, [value, defaultValue, showCharacterCount]);

    // Handle change with auto-resize
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      if (showCharacterCount) {
        setCharacterCount(e.target.value.length);
      }
      onChange?.(e);
    };

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        {/* Textarea field */}
        <textarea
          ref={textareaRef}
          id={inputId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId,
            showCharacterCount && maxLength && counterId
          )}
          className={cn(
            // Base styles
            'flex w-full rounded-lg border bg-chrome px-3 py-2 text-sm text-text-primary',
            'transition-colors duration-200',
            'placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            // Resize behavior
            autoResize ? 'resize-none overflow-hidden' : 'resize-y',
            // States
            error
              ? 'border-error focus:border-error focus:ring-error'
              : 'border-text-muted/30 hover:border-primary/50',
            disabled && 'cursor-not-allowed opacity-50',
            // Default min height
            !autoResize && 'min-h-[120px]',
            className
          )}
          {...props}
        />

        {/* Character counter */}
        {showCharacterCount && maxLength && (
          <p
            id={counterId}
            className={cn(
              'mt-1.5 text-right text-xs',
              characterCount > maxLength * 0.9
                ? 'text-warning'
                : 'text-text-muted',
              characterCount === maxLength && 'text-error'
            )}
            aria-live="polite"
          >
            {characterCount} / {maxLength}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
