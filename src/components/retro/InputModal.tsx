import { useState, useEffect, useRef } from 'react';
import { retro } from '@/styles/retro';
import { Window } from './Window';
import { TitleBar } from './TitleBar';
import { Button } from './Button';

interface InputModalProps {
  title: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  submitLabel?: string;
}

export function InputModal({
  title,
  label,
  placeholder = '',
  defaultValue = '',
  isOpen,
  onClose,
  onSubmit,
  submitLabel = 'OK',
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      // Focus input after a short delay for animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultValue]);

  // Close on escape, submit on enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && value.trim()) {
        onSubmit(value.trim());
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, value, onClose, onSubmit]);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Window
        style={{ width: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <TitleBar title={title} onClose={onClose} />
        <div style={{ padding: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontFamily: retro.font,
              marginBottom: 8,
            }}
          >
            {label}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '6px 8px',
              fontSize: 12,
              fontFamily: retro.font,
              background: retro.cream,
              border: '2px solid',
              borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
              outline: 'none',
            }}
          />
        </div>
        <div
          style={{
            padding: '8px 16px 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} active disabled={!value.trim()}>
            {submitLabel}
          </Button>
        </div>
      </Window>
    </div>
  );
}
