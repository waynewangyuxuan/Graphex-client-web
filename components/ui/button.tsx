import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';
import type { LucideIcon } from 'lucide-react';

/**
 * Button Component
 *
 * A production-ready button component with multiple variants, sizes, and states.
 * Fully accessible with keyboard navigation and screen reader support.
 *
 * @example
 * // Primary button
 * <Button variant="primary">Submit</Button>
 *
 * @example
 * // Button with icon
 * <Button variant="secondary" leftIcon={<UploadIcon />}>
 *   Upload File
 * </Button>
 *
 * @example
 * // Loading state
 * <Button isLoading disabled>Processing...</Button>
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700',
        secondary:
          'border-2 border-primary text-primary hover:bg-primary-50 active:bg-primary-100',
        tertiary: 'text-primary hover:underline',
        success: 'bg-success text-white hover:bg-green-600 active:bg-green-700',
        error: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
        warning:
          'bg-warning text-text-primary hover:bg-amber-500 active:bg-amber-600',
        ghost:
          'text-text-primary hover:bg-primary-50 active:bg-primary-100',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Show loading spinner and disable button
   */
  isLoading?: boolean;
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Spinner size="sm" variant="white" className="mr-2" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
