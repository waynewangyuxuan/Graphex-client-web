import { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import { retro } from '@/styles/retro';

interface InsetProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onContextMenu?: MouseEventHandler<HTMLDivElement>;
}

export function Inset({ children, style = {}, className, onContextMenu }: InsetProps) {
  return (
    <div
      className={className}
      onContextMenu={onContextMenu}
      style={{
        background: retro.cream,
        border: '2px solid',
        borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
