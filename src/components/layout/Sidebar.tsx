import { ReactNode } from 'react';
import { cyber } from '@/styles/cyber';

interface NavItem {
  id: string;
  label: string;
  badge?: string;
}

interface SidebarProps {
  title: string;
  version?: string;
  navItems: NavItem[];
  activeItemId: string;
  onNavItemClick: (id: string) => void;
  footer?: ReactNode;
}

export function Sidebar({
  title,
  version,
  navItems,
  activeItemId,
  onNavItemClick,
  footer,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: 240,
        background: cyber.white,
        borderRight: cyber.border,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: cyber.fontDisplay,
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          padding: '20px 16px',
          borderBottom: cyber.border,
          background: cyber.orange,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: cyber.white,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
          {version && (
            <span
              style={{
                fontSize: 10,
                verticalAlign: 'super',
                marginLeft: 4,
                opacity: 0.8,
              }}
            >
              {version}
            </span>
          )}
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflow: 'auto' }}>
        {navItems.map((item, index) => {
          const isActive = item.id === activeItemId;
          return (
            <button
              key={item.id}
              onClick={() => onNavItemClick(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: isActive ? cyber.black : 'transparent',
                color: isActive ? cyber.white : cyber.black,
                border: 'none',
                borderLeft: isActive ? `4px solid ${cyber.orange}` : '4px solid transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: cyber.fontDisplay,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderLeft = `4px solid ${cyber.black}`;
                  e.currentTarget.style.background = cyber.gray;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderLeft = '4px solid transparent';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ opacity: 0.5, marginRight: 8 }}>
                {String(index + 1).padStart(2, '0')}.
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {footer && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: cyber.border,
            background: cyber.gray,
            fontSize: 11,
          }}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
