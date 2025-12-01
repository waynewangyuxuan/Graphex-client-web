import { useNavigate } from 'react-router-dom';
import type { EntitySummary } from '@/types';
import { retro } from '@/styles/retro';
import { Inset, Button } from '@/components/retro';

interface EntityListProps {
  entities: EntitySummary[];
  selectedIds: string[];
  onSelectEntity: (id: string, multi: boolean) => void;
  onCreateEntity: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

export function EntityList({
  entities,
  selectedIds,
  onSelectEntity,
  onCreateEntity,
}: EntityListProps) {
  const navigate = useNavigate();

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    onSelectEntity(id, e.metaKey || e.ctrlKey);
  };

  const handleRowDoubleClick = (id: string) => {
    navigate(`/entity/${id}`);
  };

  const handleOpen = () => {
    if (selectedIds.length === 1) {
      navigate(`/entity/${selectedIds[0]}`);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          background: retro.gray,
          padding: '3px 8px',
          fontSize: 10,
          fontWeight: 700,
          fontFamily: retro.font,
          borderBottom: `1px solid ${retro.inset}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>═ KNOWLEDGE ENTITIES ═</span>
        <Button onClick={onCreateEntity} style={{ fontSize: 10, padding: '2px 8px' }}>
          + New
        </Button>
      </div>

      <Inset style={{ flex: 1, margin: 4, overflow: 'auto' }}>
        {entities.length === 0 ? (
          <div style={{ padding: 16, color: retro.darkGray, fontSize: 12, textAlign: 'center' }}>
            No entities yet. Click "+ New" to create one.
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              fontFamily: retro.font,
            }}
          >
            <thead>
              <tr style={{ background: retro.gray, textAlign: 'left' }}>
                <th style={{ padding: '6px 8px', width: 30 }}></th>
                <th style={{ padding: '6px 8px' }}>Name</th>
                <th style={{ padding: '6px 8px', width: 60 }}>Nodes</th>
                <th style={{ padding: '6px 8px', width: 100 }}>Modified</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity, i) => {
                const isSelected = selectedIds.includes(entity.id);
                return (
                  <tr
                    key={entity.id}
                    onClick={(e) => handleRowClick(entity.id, e)}
                    onDoubleClick={() => handleRowDoubleClick(entity.id)}
                    style={{
                      background: isSelected
                        ? retro.blue
                        : i % 2 === 0
                          ? retro.cream
                          : retro.white,
                      color: isSelected ? retro.white : retro.black,
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '6px 8px' }}>{entity.title}</td>
                    <td style={{ padding: '6px 8px' }}>{entity.stats.nodeCount}</td>
                    <td style={{ padding: '6px 8px' }}>{formatRelativeTime(entity.modifiedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Inset>

      {/* Action buttons when items selected */}
      {selectedIds.length > 0 && (
        <div style={{ padding: '0 4px 4px', display: 'flex', gap: 4 }}>
          <Button onClick={handleOpen} disabled={selectedIds.length !== 1}>
            Open
          </Button>
          <Button>Move to...</Button>
          <Button>Delete</Button>
        </div>
      )}
    </div>
  );
}
