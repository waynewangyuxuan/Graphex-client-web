import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('keydown', handleEscape); };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-sand-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className="relative w-full max-w-md mx-4 rounded-xl shadow-warm-xl border border-sand-200 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FFFEFA 0%, #FAF6EF 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-200">
          <h2 className="text-lg font-serif font-semibold text-sand-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-sand-400 hover:text-sand-600 hover:bg-sand-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-sand-200 bg-sand-50/50 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
