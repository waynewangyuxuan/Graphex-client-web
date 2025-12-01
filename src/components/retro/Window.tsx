import { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import { retro } from '@/styles/retro';

interface WindowProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Window({ children, style = {}, onClick }: WindowProps) {
  return (
    <div
      onClick={onClick}
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
