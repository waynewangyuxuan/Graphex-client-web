import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card Component
 *
 * A versatile container component using compound component pattern.
 * Provides white background with subtle shadow, perfect for grouping related content.
 *
 * @example
 * <Card>
 *   <Card.Header>
 *     <Card.Title>Settings</Card.Title>
 *     <Card.Description>Manage your account settings</Card.Description>
 *   </Card.Header>
 *   <Card.Body>
 *     Content goes here
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Save</Button>
 *   </Card.Footer>
 * </Card>
 *
 * @example
 * // Hoverable card
 * <Card hoverable>
 *   <Card.Body>Hover over me</Card.Body>
 * </Card>
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable hover effect (subtle lift and shadow increase)
   */
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-chrome rounded-lg shadow-lg',
          hoverable &&
            'transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'Card.Header';

// Card Title Component
export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level for semantic HTML
   * @default "h3"
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-lg font-semibold leading-none tracking-tight text-text-primary',
          className
        )}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'Card.Title';

// Card Description Component
export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'Card.Description';

// Card Body Component
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />;
  }
);

CardBody.displayName = 'Card.Body';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center p-6 pt-0', className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'Card.Footer';

// Attach compound components as properties
const CardWithComponents = Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
});

export { CardWithComponents as Card };
