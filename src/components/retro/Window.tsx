import { CSSProperties, ReactNode } from 'react';
import { retro } from '@/styles/retro';

interface WindowProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Window({ children, style = {} }: WindowProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: retro.windowBg,
        border: '2px solid',
        borderColor: `${retro.outset} ${retro.inset} ${retro.inset} ${retro.outset}`,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
