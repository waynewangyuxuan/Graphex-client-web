import { cyber } from '@/styles/cyber';

interface SectionHeaderProps {
  title: string;
  badge?: string;
}

export function SectionHeader({ title, badge }: SectionHeaderProps) {
  return (
    <div
      style={{
        background: cyber.black,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: cyber.border,
      }}
    >
      {badge && (
        <span
          style={{
            background: cyber.orange,
            color: cyber.white,
            padding: '2px 6px',
            fontSize: 9,
            fontWeight: 700,
            fontFamily: cyber.fontDisplay,
            textTransform: 'uppercase',
          }}
        >
          {badge}
        </span>
      )}
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          fontFamily: cyber.fontDisplay,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: cyber.white,
        }}
      >
        {title}
      </span>
    </div>
  );
}
