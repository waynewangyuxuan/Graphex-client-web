import { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import { cyber } from '@/styles/cyber';

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
        background: cyber.surface,
        border: cyber.border,
        boxShadow: cyber.shadow,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
