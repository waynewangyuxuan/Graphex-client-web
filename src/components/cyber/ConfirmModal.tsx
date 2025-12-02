import { useEffect } from 'react';
import { cyber } from '@/styles/cyber';
import { Window } from './Window';
import { TitleBar } from './TitleBar';
import { Button } from './Button';

interface ConfirmModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmModal({
  title,
  message,
  isOpen,
  onClose,
  onConfirm,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  danger = false,
}: ConfirmModalProps) {
  // Close on escape, confirm on enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') {
        onConfirm();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Window
        style={{ width: 360 }}
        onClick={(e) => e.stopPropagation()}
      >
        <TitleBar title={title} onClose={onClose} />
        <div style={{ padding: 20 }}>
          <p
            style={{
              fontSize: 14,
              fontFamily: cyber.fontBody,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>
        <div
          style={{
            padding: '12px 20px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            borderTop: cyber.border,
          }}
        >
          <Button onClick={onClose}>{cancelLabel}</Button>
          <Button
            onClick={handleConfirm}
            variant={danger ? 'danger' : 'primary'}
          >
            {confirmLabel}
          </Button>
        </div>
      </Window>
    </div>
  );
}
