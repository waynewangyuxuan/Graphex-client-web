import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input Component
 *
 * A controlled text input with error states, helper text, and icon support.
 * Follows the design system with proper focus states and accessibility.
 *
 * @example
 * // Basic input
 * <Input placeholder="Enter your name" />
 *
 * @example
 * // With label and error
 * <Input
 *   label="Email"
 *   error="Invalid email address"
 *   defaultValue="invalid@"
 * />
 *
 * @example
 * // With icons
 * <Input
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search..."
 * />
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text displayed above the input
   */
  label?: string;
  /**
   * Error message to display below input
   */
  error?: string;
  /**
   * Helper text displayed below input (when no error)
   */
  helperText?: string;
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;
  /**
   * Container class name (for spacing/positioning)
   */
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate ID for accessibility if not provided
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

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

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            type={type}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              // Base styles
              'flex h-10 w-full rounded-lg border bg-chrome px-3 py-2 text-sm text-text-primary',
              'transition-colors duration-200',
              'placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              // Icon spacing
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // States
              error
                ? 'border-error focus:border-error focus:ring-error'
                : 'border-text-muted/30 hover:border-primary/50',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>

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

Input.displayName = 'Input';

export { Input };
