'use client';

/**
 * useToast Hook
 *
 * Hook for showing toast notifications.
 * Provides a simple API to trigger success, error, warning, and info toasts.
 */

import * as React from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  toasts: Array<ToastOptions & { id: string }>;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

/**
 * Toast Provider Component
 *
 * Wrap your app with this to enable toast notifications
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<
    Array<ToastOptions & { id: string }>
  >([]);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);

    // Auto dismiss after duration (default 4000ms)
    const duration = options.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({ toast, toasts, dismiss }),
    [toast, toasts, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

/**
 * useToast Hook
 *
 * Hook to show toast notifications
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 *
 * // Success toast
 * toast({
 *   title: 'Upload successful',
 *   description: 'Your document has been uploaded',
 *   variant: 'success',
 * });
 *
 * // Error toast
 * toast({
 *   title: 'Upload failed',
 *   description: 'Please try again',
 *   variant: 'error',
 * });
 * ```
 */
export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
