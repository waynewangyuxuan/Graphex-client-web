/**
 * Toast Renderer Component
 *
 * Renders active toasts from the useToast hook.
 * Must be used inside ToastProvider.
 */

'use client';

import * as React from 'react';
import { Toast } from './toast';
import { useToast } from '@/hooks/useToast';

export function ToastRenderer() {
  const { toasts, dismiss } = useToast();

  return (
    <Toast.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} duration={toast.duration}>
          <div className="flex items-start gap-3">
            {toast.variant && Toast.Icon(toast.variant)}
            <div className="flex-1">
              <Toast.Title>{toast.title}</Toast.Title>
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </div>
          </div>
          <Toast.Close onClick={() => dismiss(toast.id)} />
        </Toast>
      ))}
      <Toast.Viewport />
    </Toast.Provider>
  );
}
