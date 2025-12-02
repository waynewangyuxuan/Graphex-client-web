import { cyber } from '@/styles/cyber';

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
}

export function PageHeader({ badge, title, description }: PageHeaderProps) {
  return (
    <header
      style={{
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: cyber.border,
      }}
    >
      {badge && (
        <span
          style={{
            display: 'inline-block',
            background: cyber.black,
            color: cyber.white,
            padding: '4px 8px',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: cyber.fontDisplay,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {badge}
        </span>
      )}
      <h2
        style={{
          fontSize: 36,
          fontWeight: 700,
          fontFamily: cyber.fontDisplay,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          margin: '8px 0',
          color: cyber.black,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: 16,
            fontFamily: cyber.fontBody,
            color: cyber.darkGray,
            margin: 0,
            maxWidth: 600,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
    </header>
  );
}
