import { useParams } from 'react-router-dom';
import { retro } from '@/styles/retro';
import { Window, TitleBar, StatusBar, SectionHeader, Inset } from '@/components/retro';

export default function EntityViewer() {
  const { id } = useParams<{ id: string }>();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: retro.desktop,
        fontFamily: retro.font,
        padding: 8,
      }}
    >
      <Window style={{ flex: 1 }}>
        <TitleBar title={`GRAPHEX.EXE — Entity: ${id}`} />

        {/* Toolbar */}
        <div
          style={{
            padding: '4px 6px',
            borderBottom: `1px solid ${retro.inset}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
          }}
        >
          <span style={{ color: retro.darkGray }}>
            Active: <strong style={{ color: retro.black }}>—</strong>
          </span>
          <span style={{ color: retro.darkGray }}>|</span>
          <span style={{ color: retro.darkGray }}>Sync: —</span>
        </div>

        {/* Split View */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Graph Panel */}
          <div
            style={{
              width: '45%',
              borderRight: `2px solid ${retro.inset}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SectionHeader title="KNOWLEDGE GRAPH" />
            <Inset style={{ flex: 1, margin: 4, position: 'relative' }}>
              {/* Grid background */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(${retro.gray}30 1px, transparent 1px),
                    linear-gradient(90deg, ${retro.gray}30 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: retro.darkGray,
                  fontSize: 12,
                }}
              >
                Graph canvas will render here
              </div>
            </Inset>
          </div>

          {/* Source Panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader title="PDF VIEWER" />
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                background: retro.white,
                padding: '20px 32px',
              }}
            >
              <div
                style={{
                  maxWidth: 600,
                  margin: '0 auto',
                  color: retro.darkGray,
                  fontSize: 12,
                }}
              >
                Source content will render here
              </div>
            </div>
          </div>
        </div>

        <StatusBar
          segments={[
            { content: 'Two-way sync active', flex: 1 },
            { content: 'Node: —' },
            { content: '0 nodes' },
          ]}
        />
      </Window>
    </div>
  );
}
