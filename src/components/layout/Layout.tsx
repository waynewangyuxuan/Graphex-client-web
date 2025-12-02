import { ReactNode } from 'react';
import { cyber } from '@/styles/cyber';

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function Layout({ sidebar, children }: LayoutProps) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        fontFamily: cyber.fontBody,
        background: cyber.concrete,
      }}
    >
      {sidebar}
      {children}
    </div>
  );
}
