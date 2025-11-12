/**
 * ScrollIndicator Component
 *
 * Displays scroll position as a percentage and provides visual feedback.
 * Updates in real-time as user scrolls through document content.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { calculateScrollPercentage } from '@/lib/scroll-utils';

// ============================================================================
// Types
// ============================================================================

export interface ScrollIndicatorProps {
  /**
   * Scrollable container element
   */
  containerRef: React.RefObject<HTMLElement>;

  /**
   * Show percentage text (default: true)
   */
  showPercentage?: boolean;

  /**
   * Position of indicator (default: 'bottom-right')
   */
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ScrollIndicator - Visual indicator of scroll position
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={containerRef} className="overflow-y-auto">
 *   {/* scrollable content *\/}
 * </div>
 * <ScrollIndicator containerRef={containerRef} />
 * ```
 */
export function ScrollIndicator({
  containerRef,
  showPercentage = true,
  position = 'bottom-right',
  className = '',
}: ScrollIndicatorProps) {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Update scroll percentage
    const handleScroll = () => {
      const percent = calculateScrollPercentage(container);
      setScrollPercent(percent);
    };

    // Initial calculation
    handleScroll();

    // Listen for scroll events
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div
      className={`
        fixed ${positionClasses[position]}
        flex items-center gap-2
        bg-chrome/90 backdrop-blur-sm
        border border-gray-200
        rounded-full
        px-3 py-1.5
        shadow-sm
        transition-opacity duration-300
        ${scrollPercent === 0 || scrollPercent === 100 ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
      role="status"
      aria-label={`Scroll progress: ${scrollPercent}%`}
    >
      {/* Progress circle */}
      <svg
        className="w-4 h-4 transform -rotate-90"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={`${2 * Math.PI * 10}`}
          strokeDashoffset={`${2 * Math.PI * 10 * (1 - scrollPercent / 100)}`}
          strokeLinecap="round"
          className="text-primary transition-all duration-300"
        />
      </svg>

      {/* Percentage text */}
      {showPercentage && (
        <span className="text-xs font-medium text-text-secondary tabular-nums">
          {scrollPercent}%
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Display Name (for DevTools)
// ============================================================================

ScrollIndicator.displayName = 'ScrollIndicator';
