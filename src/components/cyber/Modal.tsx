import { ReactNode, useEffect } from 'react';
import { cyber } from '@/styles/cyber';
import { Window } from './Window';
import { TitleBar } from './TitleBar';
import { Button } from './Button';

interface ModalProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  width?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    primary?: boolean;
    danger?: boolean;
  }>;
}

export function Modal({ title, children, isOpen, onClose, width = 400, actions }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

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
        style={{ width, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <TitleBar title={title} onClose={onClose} />
        <div
          style={{
            padding: 20,
            flex: 1,
            overflow: 'auto',
            fontFamily: cyber.fontBody,
            fontSize: 14,
          }}
        >
          {children}
        </div>
        {actions && actions.length > 0 && (
          <div
            style={{
              padding: '12px 20px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              borderTop: cyber.border,
            }}
          >
            {actions.map((action, i) => (
              <Button
                key={i}
                onClick={action.onClick}
                variant={action.danger ? 'danger' : action.primary ? 'primary' : 'default'}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </Window>
    </div>
  );
}
