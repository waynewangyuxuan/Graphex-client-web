import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  trigger: ReactNode;
}

export function ContextMenu({ items, trigger }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.right - 160, // Align right edge of menu with button
      });
    }
    setIsOpen(true);
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('keydown', handleEscape); };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="p-1.5 text-sand-400 hover:text-sand-600 rounded transition-colors"
      >
        {trigger}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 min-w-[160px] py-1 rounded-md shadow-warm-lg border border-sand-200 overflow-hidden animate-fade-in"
            style={{
              top: position.top,
              left: position.left,
              background: 'linear-gradient(180deg, #FFFEFA 0%, #FAF6EF 100%)',
            }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
                  ${item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-sand-700 hover:bg-sand-100'
                  }
                `}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
