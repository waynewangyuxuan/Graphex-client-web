import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

/**
 * Tooltip Component
 *
 * Built on Radix UI Tooltip primitive with dark background and arrow.
 * Appears after 400ms hover with smooth animations.
 *
 * @example
 * <Tooltip.Provider>
 *   <Tooltip>
 *     <Tooltip.Trigger asChild>
 *       <Button>Hover me</Button>
 *     </Tooltip.Trigger>
 *     <Tooltip.Content>
 *       <p>This is a helpful tooltip</p>
 *     </Tooltip.Content>
 *   </Tooltip>
 * </Tooltip.Provider>
 *
 * @example
 * // With side and alignment
 * <Tooltip>
 *   <Tooltip.Trigger asChild>
 *     <IconButton icon={<HelpCircle />} />
 *   </Tooltip.Trigger>
 *   <Tooltip.Content side="right" align="center">
 *     <p>Click for help</p>
 *   </Tooltip.Content>
 * </Tooltip>
 */

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 max-w-[200px] overflow-hidden rounded-md bg-text-primary px-3 py-1.5 text-xs text-white shadow-md',
      'animate-in fade-in-0 zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'data-[side=bottom]:slide-in-from-top-2',
      'data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2',
      'data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Compound export
const TooltipWithComponents = Object.assign(Tooltip, {
  Provider: TooltipProvider,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});

export { TooltipWithComponents as Tooltip };
