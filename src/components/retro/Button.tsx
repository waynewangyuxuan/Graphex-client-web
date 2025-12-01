import { ButtonHTMLAttributes, useState } from 'react';
import { retro } from '@/styles/retro';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Button({ children, active, disabled, style, ...props }: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const isPressed = pressed && !disabled;
  const isActive = active && !disabled;

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: isActive ? retro.blue : retro.gray,
        color: isActive ? retro.white : retro.black,
        border: '2px solid',
        borderColor: isPressed
          ? `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`
          : `${retro.outset} ${retro.inset} ${retro.inset} ${retro.outset}`,
        padding: '6px 16px',
        fontFamily: retro.font,
        fontSize: 12,
        fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
