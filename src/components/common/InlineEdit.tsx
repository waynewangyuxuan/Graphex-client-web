import { CSSProperties } from 'react';
import { cyber } from '@/styles/cyber';

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
  style?: CSSProperties;
  textAlign?: 'left' | 'center';
  fontSize?: number;
}

export function InlineEdit({
  value,
  onChange,
  onKeyDown,
  onBlur,
  style,
  textAlign = 'left',
  fontSize = 12,
}: InlineEditProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      autoFocus
      onClick={(e) => e.stopPropagation()}
      style={{
        fontFamily: cyber.fontBody,
        fontSize,
        padding: '4px 6px',
        border: cyber.border,
        outline: 'none',
        textAlign,
        ...style,
      }}
    />
  );
}
