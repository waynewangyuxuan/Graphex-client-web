/**
 * UI Component Library - Barrel Export
 *
 * Centralized export for all foundational UI components.
 * Import components from this file for consistency.
 *
 * @example
 * import { Button, Card, Dialog } from '@/components/ui';
 */

export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';

export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

export { Card } from './card';
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardBodyProps,
  CardFooterProps,
} from './card';

export { Dialog } from './dialog';
export type { DialogContentProps } from './dialog';

export { Input } from './input';
export type { InputProps } from './input';

export { Progress } from './progress';
export type { ProgressProps } from './progress';

export { Spinner, spinnerVariants } from './spinner';
export type { SpinnerProps } from './spinner';

export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';

export { Toast } from './toast';
export type { ToastProps, ToastActionElement } from './toast';

export { Tooltip } from './tooltip';
