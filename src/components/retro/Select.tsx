import { SelectHTMLAttributes } from 'react';
import { retro } from '@/styles/retro';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

export function Select({ options, style, ...props }: SelectProps) {
  return (
    <select
      {...props}
      style={{
        background: retro.cream,
        border: '2px solid',
        borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
        padding: '2px 4px',
        fontFamily: retro.font,
        fontSize: 11,
        cursor: 'pointer',
        ...style,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
