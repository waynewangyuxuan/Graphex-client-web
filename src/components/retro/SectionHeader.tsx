import { retro } from '@/styles/retro';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div
      style={{
        background: retro.gray,
        padding: '3px 8px',
        fontSize: 10,
        fontWeight: 700,
        fontFamily: retro.font,
        borderBottom: `1px solid ${retro.inset}`,
      }}
    >
      {title}
    </div>
  );
}
