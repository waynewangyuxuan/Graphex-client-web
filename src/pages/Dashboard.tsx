import { retro } from '@/styles/retro';
import { Window, TitleBar, StatusBar, SectionHeader, Inset, Button } from '@/components/retro';

export default function Dashboard() {
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
        <TitleBar title="GRAPHEX.EXE — Library" />

        {/* Menu Bar */}
        <div
          style={{
            padding: '2px 4px',
            borderBottom: `1px solid ${retro.inset}`,
            display: 'flex',
            gap: 16,
            fontSize: 12,
          }}
        >
          {['File', 'Edit', 'View', 'Help'].map((item) => (
            <span key={item} style={{ cursor: 'pointer' }}>
              {item}
            </span>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Folder Tree */}
          <div
            style={{
              width: 180,
              borderRight: `2px solid ${retro.inset}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SectionHeader title="═ FOLDERS ═" />
            <Inset style={{ flex: 1, margin: 4, overflow: 'auto' }}>
              <div style={{ padding: 8 }}>
                <div style={{ padding: '4px 0', cursor: 'pointer' }}>▼ All Items</div>
                <div style={{ padding: '4px 0', paddingLeft: 12, cursor: 'pointer' }}>
                  ▶ Research
                </div>
                <div style={{ padding: '4px 0', paddingLeft: 12, cursor: 'pointer' }}>▶ Work</div>
              </div>
            </Inset>
            <div style={{ padding: 4 }}>
              <Button style={{ width: '100%', fontSize: 11 }}>+ New Folder</Button>
            </div>
          </div>

          {/* Entity List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader title="═ KNOWLEDGE ENTITIES ═" />
            <Inset style={{ flex: 1, margin: 4, overflow: 'auto' }}>
              <div style={{ padding: 8, color: retro.darkGray, fontSize: 12 }}>
                No entities yet. Click "+ New" to create one.
              </div>
            </Inset>
          </div>
        </div>

        <StatusBar
          segments={[
            { content: 'Ready', flex: 1 },
            { content: '0 entities' },
            { content: '0 nodes' },
          ]}
        />
      </Window>
    </div>
  );
}
