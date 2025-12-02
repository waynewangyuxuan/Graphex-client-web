import { useEffect, useRef } from 'react';
import { cyber } from '@/styles/cyber';

interface MenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        background: cyber.white,
        border: cyber.border,
        boxShadow: cyber.shadow,
        minWidth: 160,
        zIndex: 1001,
        fontFamily: cyber.fontDisplay,
        fontSize: 12,
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div
            key={i}
            style={{
              height: 2,
              background: cyber.black,
              margin: '4px 0',
            }}
          />
        ) : (
          <div
            key={i}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            style={{
              padding: '8px 14px',
              cursor: item.disabled ? 'default' : 'pointer',
              color: item.disabled ? cyber.darkGray : cyber.black,
              background: 'transparent',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.02em',
              transition: 'all 0.1s ease',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.background = cyber.black;
                e.currentTarget.style.color = cyber.white;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = item.disabled ? cyber.darkGray : cyber.black;
            }}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  );
}
