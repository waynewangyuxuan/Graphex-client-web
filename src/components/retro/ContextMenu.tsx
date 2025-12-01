import { useEffect, useRef } from 'react';
import { retro } from '@/styles/retro';

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
        background: retro.windowBg,
        border: '2px solid',
        borderColor: `${retro.outset} ${retro.inset} ${retro.inset} ${retro.outset}`,
        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        minWidth: 150,
        zIndex: 1001,
        fontFamily: retro.font,
        fontSize: 12,
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div
            key={i}
            style={{
              height: 1,
              background: retro.darkGray,
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
              padding: '6px 12px',
              cursor: item.disabled ? 'default' : 'pointer',
              color: item.disabled ? retro.darkGray : retro.black,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.background = retro.blue;
                e.currentTarget.style.color = retro.white;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = item.disabled ? retro.darkGray : retro.black;
            }}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  );
}
