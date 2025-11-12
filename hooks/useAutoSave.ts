/**
 * useAutoSave Hook
 *
 * Custom hook for debounced auto-save functionality.
 * Provides automatic saving with configurable delay, save status tracking,
 * and manual save trigger.
 *
 * @example
 * ```typescript
 * const { isSaving, lastSaved, saveNow } = useAutoSave(content, {
 *   onSave: (content) => updateNoteMutation.mutate({ noteId, content }),
 *   delay: 2000,
 *   enabled: isModalOpen
 * });
 *
 * return (
 *   <div>
 *     <textarea value={content} onChange={(e) => setContent(e.target.value)} />
 *     <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />
 *     <Button onClick={saveNow}>Save Now</Button>
 *   </div>
 * );
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAutoSaveOptions {
  /**
   * Function to call when saving
   */
  onSave: (content: string) => void;
  /**
   * Debounce delay in milliseconds
   * @default 2000
   */
  delay?: number;
  /**
   * Whether auto-save is enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Minimum content length to trigger save
   * @default 1
   */
  minLength?: number;
}

export interface UseAutoSaveReturn {
  /**
   * Whether a save operation is in progress
   */
  isSaving: boolean;
  /**
   * Timestamp of last successful save
   */
  lastSaved: Date | null;
  /**
   * Trigger an immediate save (bypasses debounce)
   */
  saveNow: () => void;
  /**
   * Cancel pending save operation
   */
  cancelPendingSave: () => void;
}

/**
 * Auto-save hook with debouncing
 *
 * Automatically saves content after a delay when it changes.
 * Tracks save status and provides manual save trigger.
 *
 * @param content - Content to save
 * @param options - Auto-save configuration
 * @returns Save state and control functions
 */
export function useAutoSave(
  content: string,
  options: UseAutoSaveOptions
): UseAutoSaveReturn {
  const {
    onSave,
    delay = 2000,
    enabled = true,
    minLength = 1,
  } = options;

  // State
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs to track previous values
  const previousContentRef = useRef<string>(content);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onSaveRef = useRef(onSave);

  // Keep onSave ref up to date (avoid stale closure)
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Cancel pending save
  const cancelPendingSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Execute save operation
  const executeSave = useCallback(
    (contentToSave: string) => {
      // Don't save if content is too short
      if (contentToSave.length < minLength) {
        return;
      }

      // Don't save if content hasn't changed
      if (contentToSave === previousContentRef.current) {
        return;
      }

      // Call the save function (synchronously)
      onSaveRef.current(contentToSave);
      previousContentRef.current = contentToSave;
      setLastSaved(new Date());
    },
    [minLength]
  );

  // Manual save (immediate, bypasses debounce)
  const saveNow = useCallback(() => {
    cancelPendingSave();
    executeSave(content);
  }, [content, cancelPendingSave, executeSave]);

  // Auto-save effect (debounced)
  useEffect(() => {
    // Don't auto-save if disabled
    if (!enabled) {
      cancelPendingSave();
      return;
    }

    // Don't save if content hasn't changed
    if (content === previousContentRef.current) {
      return;
    }

    // Don't save if content is too short
    if (content.length < minLength) {
      cancelPendingSave();
      return;
    }

    // Cancel any pending save
    cancelPendingSave();

    // Schedule new save
    timeoutRef.current = setTimeout(() => {
      executeSave(content);
      timeoutRef.current = null;
    }, delay);

    // Cleanup on unmount or content change
    return () => {
      cancelPendingSave();
    };
  }, [content, enabled, delay, minLength, cancelPendingSave, executeSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPendingSave();
    };
  }, [cancelPendingSave]);

  return {
    isSaving,
    lastSaved,
    saveNow,
    cancelPendingSave,
  };
}
