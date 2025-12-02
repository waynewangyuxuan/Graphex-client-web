import { useParams, useNavigate } from 'react-router-dom';
import { cyber } from '@/styles/cyber';
import { Layout, Sidebar, ContentArea, PageHeader } from '@/components/layout';
import { SectionHeader, Inset } from '@/components/cyber';

export default function EntityViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Layout
      sidebar={
        <Sidebar
          title="GRAPHEX"
          version="v0.1"
          navItems={[
            { id: 'library', label: 'Library' },
            { id: 'upload', label: 'Upload' },
            { id: 'settings', label: 'Settings' },
          ]}
          activeItemId="library"
          onNavItemClick={(itemId) => {
            if (itemId === 'library') navigate('/');
          }}
          footer={
            <div style={{ fontFamily: cyber.fontDisplay }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase' }}>
                Entity: {id?.slice(0, 12)}...
              </div>
              <div style={{ fontSize: 10, color: cyber.orange, fontWeight: 700 }}>
                ● EDITING
              </div>
            </div>
          }
        />
      }
    >
      <ContentArea showGrid={false}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: cyber.border }}>
            <PageHeader
              badge="ENTITY"
              title={id || 'Untitled'}
              description="Knowledge Graph Viewer"
            />
          </div>

          {/* Toolbar */}
          <div
            style={{
              padding: '8px 24px',
              borderBottom: cyber.border,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 11,
              fontFamily: cyber.fontDisplay,
              textTransform: 'uppercase',
              background: cyber.white,
            }}
          >
            <span style={{ color: cyber.darkGray }}>
              Status: <strong style={{ color: cyber.black }}>Active</strong>
            </span>
            <span style={{ color: cyber.darkGray }}>|</span>
            <span style={{ color: cyber.darkGray }}>
              Sync: <strong style={{ color: cyber.success }}>Connected</strong>
            </span>
            <span style={{ color: cyber.darkGray }}>|</span>
            <span style={{ color: cyber.darkGray }}>
              Nodes: <strong style={{ color: cyber.black }}>0</strong>
            </span>
          </div>

          {/* Split View */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Graph Panel */}
            <div
              style={{
                width: '50%',
                borderRight: cyber.border,
                display: 'flex',
                flexDirection: 'column',
                background: cyber.white,
              }}
            >
              <SectionHeader title="KNOWLEDGE GRAPH" badge="GRAPH" />
              <Inset style={{ flex: 1, margin: 8, position: 'relative' }}>
                {/* Grid background */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                      linear-gradient(${cyber.gray} 1px, transparent 1px),
                      linear-gradient(90deg, ${cyber.gray} 1px, transparent 1px)
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
                    color: cyber.darkGray,
                    fontSize: 12,
                    fontFamily: cyber.fontDisplay,
                    textTransform: 'uppercase',
                  }}
                >
                  Graph canvas will render here
                </div>
              </Inset>
            </div>

            {/* Source Panel */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: cyber.white,
              }}
            >
              <SectionHeader title="PDF VIEWER" badge="SOURCE" />
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  background: cyber.white,
                  padding: '24px 32px',
                }}
              >
                <div
                  style={{
                    maxWidth: 600,
                    margin: '0 auto',
                    color: cyber.darkGray,
                    fontSize: 12,
                    fontFamily: cyber.fontDisplay,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    paddingTop: 100,
                  }}
                >
                  Source content will render here
                </div>
              </div>
            </div>
          </div>

          {/* Footer Status */}
          <div
            style={{
              padding: '8px 24px',
              borderTop: cyber.border,
              background: cyber.black,
              color: cyber.white,
              fontSize: 10,
              fontFamily: cyber.fontDisplay,
              textTransform: 'uppercase',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Two-way sync active</span>
            <span>Ready</span>
          </div>
        </div>
      </ContentArea>
    </Layout>
  );
}
