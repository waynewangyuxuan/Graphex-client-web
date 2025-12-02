import { useState, useRef, useEffect } from 'react';
import { cyber } from '@/styles/cyber';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  style?: React.CSSProperties;
}

export function Select({ value, onChange, options, style }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      {/* Select button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: hovered ? cyber.black : cyber.white,
          color: hovered ? cyber.white : cyber.black,
          border: cyber.border,
          boxShadow: hovered ? `2px 2px 0 ${cyber.black}` : cyber.shadow,
          transform: hovered ? 'translate(-1px, -1px)' : 'none',
          cursor: 'pointer',
          fontFamily: cyber.fontDisplay,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          minWidth: 100,
          transition: 'all 0.1s ease',
        }}
      >
        <span
          style={{
            flex: 1,
            padding: '6px 10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {selectedOption?.label || 'Select...'}
        </span>
        <span
          style={{
            padding: '6px 10px',
            borderLeft: cyber.borderLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ▼
        </span>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: cyber.white,
            border: cyber.border,
            boxShadow: cyber.shadow,
            zIndex: 100,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontFamily: cyber.fontDisplay,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: opt.value === value ? cyber.black : 'transparent',
                color: opt.value === value ? cyber.white : cyber.black,
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) {
                  e.currentTarget.style.background = cyber.gray;
                }
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
