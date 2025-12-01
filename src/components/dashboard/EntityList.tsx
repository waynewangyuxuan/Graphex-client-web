import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EntitySummary } from '@/types';
import { retro } from '@/styles/retro';
import { Inset, Button, Select, ContextMenu } from '@/components/retro';

type ViewMode = 'list' | 'icon';
type SortField = 'title' | 'modifiedAt' | 'createdAt' | 'nodeCount';
type SortOrder = 'asc' | 'desc';

interface EntityListProps {
  entities: EntitySummary[];
  selectedIds: string[];
  currentFolderName: string | null;
  onSelectEntity: (id: string, multi: boolean) => void;
  onCreateEntity: () => void;
  onCreateFolder: () => void;
  onDeleteEntities: (ids: string[]) => void;
  onMoveEntities: (ids: string[]) => void;
  onDragStart?: (ids: string[]) => void;
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
  currentFolderName,
  onSelectEntity,
  onCreateEntity,
  onCreateFolder,
  onDeleteEntities,
  onMoveEntities,
  onDragStart,
}: EntityListProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('modifiedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; isEmptySpace: boolean } | null>(null);

  // Sort entities
  const sortedEntities = [...entities].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'modifiedAt':
        cmp = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
        break;
      case 'createdAt':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'nodeCount':
        cmp = a.stats.nodeCount - b.stats.nodeCount;
        break;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    onSelectEntity(id, e.metaKey || e.ctrlKey);
  };

  const handleRowDoubleClick = (id: string) => {
    navigate(`/entity/${id}`);
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedIds.includes(id)) {
      onSelectEntity(id, false);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, isEmptySpace: false });
  };

  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    // Only trigger if clicking on empty space, not on items
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('table, .icon-grid') === null) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, isEmptySpace: true });
    }
  };

  const handleOpen = () => {
    if (selectedIds.length === 1) {
      navigate(`/entity/${selectedIds[0]}`);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    e.dataTransfer.setData('entityIds', JSON.stringify(ids));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(ids);
  };

  const itemContextMenuItems = [
    { label: 'Open', onClick: handleOpen, disabled: selectedIds.length !== 1 },
    { label: '', onClick: () => {}, divider: true },
    { label: 'Move to...', onClick: () => onMoveEntities(selectedIds) },
    { label: '', onClick: () => {}, divider: true },
    {
      label: `Delete${selectedIds.length > 1 ? ` (${selectedIds.length})` : ''}`,
      onClick: () => onDeleteEntities(selectedIds),
    },
  ];

  const emptySpaceContextMenuItems = [
    { label: 'New Knowledge Entity', onClick: onCreateEntity },
    { label: 'New Folder', onClick: onCreateFolder },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Section Header */}
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
        ═ {currentFolderName ? currentFolderName.toUpperCase() : 'ALL ITEMS'} ═
      </div>

      {/* Toolbar */}
      <div
        style={{
          padding: '4px 8px',
          borderBottom: `1px solid ${retro.gray}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: retro.windowBg,
        }}
      >
        {/* Action buttons */}
        <Button
          onClick={handleOpen}
          disabled={selectedIds.length !== 1}
          style={{ fontSize: 10, padding: '2px 8px' }}
        >
          Open
        </Button>
        <Button
          onClick={() => onMoveEntities(selectedIds)}
          disabled={selectedIds.length === 0}
          style={{ fontSize: 10, padding: '2px 8px' }}
        >
          Move to...
        </Button>
        <Button
          onClick={() => onDeleteEntities(selectedIds)}
          disabled={selectedIds.length === 0}
          style={{ fontSize: 10, padding: '2px 8px' }}
        >
          Delete
        </Button>

        <div style={{ width: 1, height: 16, background: retro.gray }} />

        <Button onClick={onCreateEntity} style={{ fontSize: 10, padding: '2px 8px' }}>
          + New
        </Button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={() => setViewMode('list')}
            active={viewMode === 'list'}
            style={{ fontSize: 10, padding: '2px 6px' }}
            title="List View"
          >
            ☰
          </Button>
          <Button
            onClick={() => setViewMode('icon')}
            active={viewMode === 'icon'}
            style={{ fontSize: 10, padding: '2px 6px' }}
            title="Icon View"
          >
            ⊞
          </Button>
        </div>

        <div style={{ width: 1, height: 16, background: retro.gray }} />

        {/* Sort options */}
        <Select
          value={sortField}
          onChange={(value: string) => setSortField(value as SortField)}
          options={[
            { value: 'title', label: 'Name' },
            { value: 'modifiedAt', label: 'Date Modified' },
            { value: 'createdAt', label: 'Date Added' },
            { value: 'nodeCount', label: 'Nodes' },
          ]}
        />
        <Button
          onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
          style={{ fontSize: 10, padding: '2px 6px' }}
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Content area */}
      <Inset style={{ flex: 1, margin: 4, overflow: 'auto' }} onContextMenu={handleEmptySpaceContextMenu}>
        {sortedEntities.length === 0 ? (
          <div style={{ padding: 16, color: retro.darkGray, fontSize: 12, textAlign: 'center' }}>
            No entities yet. Click "+ New" to create one.
          </div>
        ) : viewMode === 'list' ? (
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
              {sortedEntities.map((entity, i) => {
                const isSelected = selectedIds.includes(entity.id);
                return (
                  <tr
                    key={entity.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, entity.id)}
                    onClick={(e) => handleRowClick(entity.id, e)}
                    onDoubleClick={() => handleRowDoubleClick(entity.id)}
                    onContextMenu={(e) => handleContextMenu(e, entity.id)}
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
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ marginRight: 6 }}>📄</span>
                      {entity.title}
                    </td>
                    <td style={{ padding: '6px 8px' }}>{entity.stats.nodeCount}</td>
                    <td style={{ padding: '6px 8px' }}>{formatRelativeTime(entity.modifiedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Icon View */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 8,
              padding: 8,
            }}
          >
            {sortedEntities.map((entity) => {
              const isSelected = selectedIds.includes(entity.id);
              return (
                <div
                  key={entity.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, entity.id)}
                  onClick={(e) => handleRowClick(entity.id, e)}
                  onDoubleClick={() => handleRowDoubleClick(entity.id)}
                  onContextMenu={(e) => handleContextMenu(e, entity.id)}
                  style={{
                    padding: 8,
                    textAlign: 'center',
                    background: isSelected ? retro.blue : 'transparent',
                    color: isSelected ? retro.white : retro.black,
                    cursor: 'pointer',
                    border: '1px solid transparent',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 4 }}>📄</div>
                  <div
                    style={{
                      fontSize: 11,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entity.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Inset>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.isEmptySpace ? emptySpaceContextMenuItems : itemContextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
