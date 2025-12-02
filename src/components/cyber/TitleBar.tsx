import { cyber } from '@/styles/cyber';

interface TitleBarProps {
  title: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function TitleBar({ title, onMinimize, onMaximize, onClose }: TitleBarProps) {
  const buttons = [
    { symbol: '_', onClick: onMinimize },
    { symbol: '□', onClick: onMaximize },
    { symbol: '×', onClick: onClose },
  ].filter((b) => b.onClick);

  return (
    <div
      style={{
        background: cyber.black,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        borderBottom: cyber.border,
      }}
    >
      <span
        style={{
          color: cyber.white,
          fontSize: 14,
          fontWeight: 700,
          flex: 1,
          fontFamily: cyber.fontDisplay,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        {buttons.map(({ symbol, onClick }, i) => (
          <button
            key={i}
            onClick={onClick}
            style={{
              width: 20,
              height: 20,
              background: cyber.white,
              border: `1px solid ${cyber.white}`,
              fontWeight: 700,
              fontSize: 12,
              cursor: onClick ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: cyber.fontDisplay,
              transition: 'all 0.1s ease',
            }}
            onMouseEnter={(e) => {
              if (onClick) {
                e.currentTarget.style.background = symbol === '×' ? cyber.orange : cyber.black;
                e.currentTarget.style.color = cyber.white;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cyber.white;
              e.currentTarget.style.color = cyber.black;
            }}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
