import { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import { cyber } from '@/styles/cyber';

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
        background: cyber.white,
        border: cyber.border,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
