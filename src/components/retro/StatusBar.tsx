import { ReactNode } from 'react';
import { retro } from '@/styles/retro';

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
        background: retro.windowBg,
        borderTop: `2px solid ${retro.inset}`,
        padding: '2px 4px',
        display: 'flex',
        gap: 2,
      }}
    >
      {segments.map((segment, i) => (
        <div
          key={i}
          style={{
            flex: segment.flex || 'none',
            padding: '1px 6px',
            border: '1px solid',
            borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
            fontSize: 10,
            fontFamily: retro.font,
            whiteSpace: 'nowrap',
          }}
        >
          {segment.content}
        </div>
      ))}
    </div>
  );
}
