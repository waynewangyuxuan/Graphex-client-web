import { useState, useRef, useEffect } from 'react';
import { retro } from '@/styles/retro';

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
        style={{
          display: 'flex',
          alignItems: 'center',
          background: retro.cream,
          border: '2px solid',
          borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
          cursor: 'pointer',
          fontFamily: retro.font,
          fontSize: 11,
          minWidth: 100,
        }}
      >
        <span
          style={{
            flex: 1,
            padding: '3px 6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {selectedOption?.label || 'Select...'}
        </span>
        <span
          style={{
            padding: '3px 6px',
            borderLeft: `1px solid ${retro.gray}`,
            background: retro.windowBg,
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
            marginTop: 1,
            background: retro.cream,
            border: '2px solid',
            borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
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
                padding: '4px 8px',
                cursor: 'pointer',
                fontFamily: retro.font,
                fontSize: 11,
                background: opt.value === value ? retro.blue : 'transparent',
                color: opt.value === value ? retro.white : retro.black,
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) {
                  e.currentTarget.style.background = retro.highlight;
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
