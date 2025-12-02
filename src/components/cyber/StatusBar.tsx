import { ReactNode } from 'react';
import { cyber } from '@/styles/cyber';

interface StatusSegment {
  content: ReactNode;
  flex?: number;
}

interface StatusBarProps {
  segments: StatusSegment[];
}

export function StatusBar({ segments }: StatusBarProps) {
  return (
    <div
      style={{
        background: cyber.white,
        borderTop: cyber.border,
        padding: '4px 8px',
        display: 'flex',
        gap: 8,
      }}
    >
      {segments.map((segment, i) => (
        <div
          key={i}
          style={{
            flex: segment.flex || 'none',
            padding: '4px 8px',
            border: cyber.borderLight,
            fontSize: 11,
            fontFamily: cyber.fontDisplay,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
          }}
        >
          {segment.content}
        </div>
      ))}
    </div>
  );
}
