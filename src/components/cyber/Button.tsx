import { ButtonHTMLAttributes, useState } from 'react';
import { cyber } from '@/styles/cyber';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}

export function Button({
  children,
  active,
  disabled,
  variant = 'default',
  style,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const isHovered = hovered && !disabled;
  const isActive = active && !disabled;

  // Variant colors
  const getColors = () => {
    if (disabled) {
      return { bg: cyber.gray, color: cyber.darkGray };
    }
    if (isActive || variant === 'primary') {
      return {
        bg: isHovered ? cyber.white : cyber.black,
        color: isHovered ? cyber.black : cyber.white,
      };
    }
    if (variant === 'danger') {
      return {
        bg: isHovered ? cyber.orange : cyber.white,
        color: isHovered ? cyber.white : cyber.black,
      };
    }
    // Default
    return {
      bg: isHovered ? cyber.black : cyber.white,
      color: isHovered ? cyber.white : cyber.black,
    };
  };

  const colors = getColors();

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.bg,
        color: colors.color,
        border: cyber.border,
        padding: '8px 16px',
        fontFamily: cyber.fontDisplay,
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.1s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
