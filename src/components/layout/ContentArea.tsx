import { CSSProperties, ReactNode } from 'react';
import { cyber } from '@/styles/cyber';

interface ContentAreaProps {
  children: ReactNode;
  style?: CSSProperties;
  showGrid?: boolean;
}

export function ContentArea({ children, style, showGrid = true }: ContentAreaProps) {
  return (
    <main
      style={{
        flex: 1,
        overflow: 'auto',
        background: showGrid ? cyber.concrete : cyber.white,
        backgroundImage: showGrid
          ? `linear-gradient(to right, ${cyber.gray} 1px, transparent 1px),
             linear-gradient(to bottom, ${cyber.gray} 1px, transparent 1px)`
          : 'none',
        backgroundSize: '20px 20px',
        ...style,
      }}
    >
      {children}
    </main>
  );
}
