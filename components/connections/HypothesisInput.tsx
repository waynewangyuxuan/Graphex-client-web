/**
 * HypothesisInput Component
 *
 * Textarea input for user's hypothesis with:
 * - Minimum 50 characters validation
 * - Real-time character counter with color coding
 * - Shake animation on invalid submit attempt
 * - Disabled state after submission
 *
 * Used in ConnectionModal for pre-explanation retrieval flow.
 */

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface HypothesisInputProps {
  /**
   * Current value of the hypothesis
   */
  value: string;
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  /**
   * Disabled state (after submission)
   */
  disabled?: boolean;
  /**
   * Show validation error
   */
  showError?: boolean;
  /**
   * Trigger shake animation
   */
  shouldShake?: boolean;
  /**
   * Minimum character requirement
   * @default 50
   */
  minChars?: number;
  /**
   * Maximum character limit
   * @default 1000
   */
  maxChars?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * HypothesisInput component
 *
 * @example
 * ```tsx
 * const [hypothesis, setHypothesis] = useState('');
 * const [showError, setShowError] = useState(false);
 * const [shouldShake, setShouldShake] = useState(false);
 *
 * const handleSubmit = () => {
 *   if (hypothesis.length < 50) {
 *     setShowError(true);
 *     setShouldShake(true);
 *     setTimeout(() => setShouldShake(false), 500);
 *     return;
 *   }
 *   // Submit hypothesis...
 * };
 *
 * <HypothesisInput
 *   value={hypothesis}
 *   onChange={setHypothesis}
 *   showError={showError}
 *   shouldShake={shouldShake}
 * />
 * ```
 */
export function HypothesisInput({
  value,
  onChange,
  disabled = false,
  showError = false,
  shouldShake = false,
  minChars = 50,
  maxChars = 1000,
  className,
}: HypothesisInputProps) {
  const [isShaking, setIsShaking] = useState(false);
  const charCount = value.length;
  const isValid = charCount >= minChars;
  const isNearMax = charCount > maxChars * 0.9;

  // Handle shake animation
  useEffect(() => {
    if (shouldShake) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShake]);

  // Get character counter color based on state
  const getCounterColor = () => {
    if (charCount === 0) return 'text-text-muted';
    if (!isValid) return 'text-error';
    if (isNearMax) return 'text-warning';
    return 'text-success';
  };

  // Get counter message
  const getCounterMessage = () => {
    if (charCount === 0) return `${charCount} / ${minChars} characters (minimum)`;
    if (!isValid) {
      const remaining = minChars - charCount;
      return `${remaining} more character${remaining !== 1 ? 's' : ''} needed`;
    }
    return `${charCount} / ${maxChars} characters`;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Textarea */}
      <div
        className={cn(
          'transition-transform duration-100',
          isShaking && 'animate-shake'
        )}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxChars}
          placeholder="What's your thinking? Why might these concepts be connected?"
          className={cn(
            'min-h-[120px] font-sans text-base',
            disabled && 'bg-gray-50 cursor-not-allowed'
          )}
          aria-label="Your hypothesis about the connection"
          aria-invalid={showError && !isValid}
          aria-describedby="hypothesis-counter"
        />
      </div>

      {/* Character counter and validation */}
      <div className="flex items-center justify-between gap-4">
        {/* Validation message */}
        <div className="flex-1 min-w-0">
          {showError && !isValid && (
            <p className="text-sm text-error animate-in fade-in-50 duration-200">
              Please write at least {minChars} characters to explain your
              thinking
            </p>
          )}
        </div>

        {/* Character counter */}
        <p
          id="hypothesis-counter"
          className={cn(
            'text-sm font-medium whitespace-nowrap transition-colors',
            getCounterColor()
          )}
          aria-live="polite"
        >
          {getCounterMessage()}
        </p>
      </div>

      {/* Helper text (shown when not disabled and not showing error) */}
      {!disabled && !showError && (
        <p className="text-sm text-text-secondary">
          Take a moment to think through why these concepts might be connected.
          Your hypothesis helps activate prior knowledge.
        </p>
      )}

      {/* Locked state message */}
      {disabled && (
        <p className="text-sm text-text-muted italic">
          Your hypothesis has been saved and locked for comparison
        </p>
      )}
    </div>
  );
}
