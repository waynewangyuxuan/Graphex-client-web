import { CSSProperties, ReactNode } from 'react';
import { retro } from '@/styles/retro';

interface InsetProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Inset({ children, style = {}, className }: InsetProps) {
  return (
    <div
      className={className}
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
