import { retro } from '@/styles/retro';

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
  ];

  return (
    <div
      style={{
        background: `linear-gradient(90deg, ${retro.blue} 0%, ${retro.lightBlue} 100%)`,
        padding: '4px 6px',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          color: retro.white,
          fontSize: 12,
          fontWeight: 700,
          flex: 1,
          fontFamily: retro.font,
        }}
      >
        {title}
      </span>
      <div style={{ display: 'flex', gap: 2 }}>
        {buttons.map(({ symbol, onClick }, i) => (
          <button
            key={i}
            onClick={onClick}
            style={{
              width: 18,
              height: 18,
              background: retro.windowBg,
              border: `1px solid ${retro.black}`,
              fontWeight: 700,
              fontSize: 12,
              cursor: onClick ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: retro.font,
            }}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
