import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EntitySummary, Folder } from '@/types';
import { retro } from '@/styles/retro';
import { Inset, Button, Select, ContextMenu, InputModal, ConfirmModal } from '@/components/retro';

type ViewMode = 'list' | 'icon';
type SortField = 'name' | 'modifiedAt' | 'createdAt' | 'type';
type SortOrder = 'asc' | 'desc';

// Combined type for displaying both folders and entities
type FileItem =
  | { type: 'folder'; id: string; name: string; data: Folder }
  | { type: 'entity'; id: string; name: string; data: EntitySummary };

interface EntityListProps {
  folders: Folder[];
  entities: EntitySummary[];
  selectedIds: string[];
  currentFolderName: string | null;
  showAllItems: boolean;
  onToggleShowAll: () => void;
  onSelectItem: (id: string, multi: boolean) => void;
  onNavigateToFolder: (folderId: string) => void;
  onCreateEntity: () => void;
  onCreateFolder: () => void;
  onDeleteEntities: (ids: string[]) => void;
  onMoveItems: (ids: string[]) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDragStart?: (ids: string[], type: 'entity' | 'folder') => void;
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
  folders,
  entities,
  selectedIds,
  currentFolderName,
  showAllItems,
  onToggleShowAll,
  onSelectItem,
  onNavigateToFolder,
  onCreateEntity,
  onCreateFolder,
  onDeleteEntities,
  onMoveItems,
  onRenameFolder,
  onDeleteFolder,
  onDragStart,
}: EntityListProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'empty' | 'folder' | 'entity' | 'mixed';
    itemId?: string;
  } | null>(null);

  // Modals for folder operations
  const [renameModal, setRenameModal] = useState<{ id: string; name: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string; type: 'folder' | 'entity' } | null>(null);

  // Combine folders and entities into a single list
  const items: FileItem[] = [
    ...folders.map((f): FileItem => ({ type: 'folder', id: f.id, name: f.name, data: f })),
    ...entities.map((e): FileItem => ({ type: 'entity', id: e.id, name: e.title, data: e })),
  ];

  // Sort items (folders first by default when sorting by type)
  const sortedItems = [...items].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'type':
        // Folders first
        if (a.type === 'folder' && b.type === 'entity') cmp = -1;
        else if (a.type === 'entity' && b.type === 'folder') cmp = 1;
        else cmp = a.name.localeCompare(b.name);
        break;
      case 'modifiedAt':
        const aDate = a.type === 'entity' ? new Date(a.data.modifiedAt).getTime() : 0;
        const bDate = b.type === 'entity' ? new Date(b.data.modifiedAt).getTime() : 0;
        cmp = aDate - bDate;
        break;
      case 'createdAt':
        const aCreated = a.type === 'entity' ? new Date(a.data.createdAt).getTime() : 0;
        const bCreated = b.type === 'entity' ? new Date(b.data.createdAt).getTime() : 0;
        cmp = aCreated - bCreated;
        break;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    onSelectItem(id, e.metaKey || e.ctrlKey);
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      onNavigateToFolder(item.id);
    } else {
      navigate(`/entity/${item.id}`);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedIds.includes(item.id)) {
      onSelectItem(item.id, false);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, type: item.type, itemId: item.id });
  };

  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('table, .icon-grid') === null) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, type: 'empty' });
    }
  };

  const handleOpen = () => {
    if (selectedIds.length === 1) {
      const item = items.find((i) => i.id === selectedIds[0]);
      if (item) {
        if (item.type === 'folder') {
          onNavigateToFolder(item.id);
        } else {
          navigate(`/entity/${item.id}`);
        }
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, item: FileItem) => {
    const ids = selectedIds.includes(item.id) ? selectedIds : [item.id];
    if (item.type === 'folder') {
      e.dataTransfer.setData('folderId', item.id);
    } else {
      e.dataTransfer.setData('entityIds', JSON.stringify(ids.filter((id) => entities.some((e) => e.id === id))));
    }
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(ids, item.type);
  };

  const getContextMenuItems = () => {
    if (contextMenu?.type === 'empty') {
      return [
        { label: 'New Knowledge Entity', onClick: onCreateEntity },
        { label: 'New Folder', onClick: onCreateFolder },
      ];
    }

    if (contextMenu?.type === 'folder') {
      const folder = folders.find((f) => f.id === contextMenu.itemId);
      return [
        { label: 'Open', onClick: handleOpen },
        { label: '', onClick: () => {}, divider: true },
        {
          label: 'Rename',
          onClick: () => {
            if (folder) setRenameModal({ id: folder.id, name: folder.name });
          },
        },
        { label: '', onClick: () => {}, divider: true },
        {
          label: 'Delete',
          onClick: () => {
            if (folder) setDeleteModal({ id: folder.id, name: folder.name, type: 'folder' });
          },
        },
      ];
    }

    // Entity context menu
    const selectedEntities = selectedIds.filter((id) => entities.some((e) => e.id === id));
    return [
      { label: 'Open', onClick: handleOpen, disabled: selectedIds.length !== 1 },
      { label: '', onClick: () => {}, divider: true },
      { label: 'Move to...', onClick: () => onMoveItems(selectedEntities) },
      { label: '', onClick: () => {}, divider: true },
      {
        label: `Delete${selectedEntities.length > 1 ? ` (${selectedEntities.length})` : ''}`,
        onClick: () => onDeleteEntities(selectedEntities),
      },
    ];
  };

  const handleConfirmRename = (newName: string) => {
    if (renameModal) {
      onRenameFolder(renameModal.id, newName);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteModal) {
      if (deleteModal.type === 'folder') {
        onDeleteFolder(deleteModal.id);
      } else {
        onDeleteEntities([deleteModal.id]);
      }
    }
  };

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
        ═ {currentFolderName ? currentFolderName.toUpperCase() : 'HOME'}
        {showAllItems ? ' (ALL)' : ''} ═
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
        <Button
          onClick={handleOpen}
          disabled={selectedIds.length !== 1}
          style={{ fontSize: 10, padding: '2px 8px' }}
        >
          Open
        </Button>
        <Button
          onClick={() => {
            const entityIds = selectedIds.filter((id) => entities.some((e) => e.id === id));
            if (entityIds.length > 0) onMoveItems(entityIds);
          }}
          disabled={selectedIds.length === 0}
          style={{ fontSize: 10, padding: '2px 8px' }}
        >
          Move to...
        </Button>
        <Button
          onClick={() => {
            const entityIds = selectedIds.filter((id) => entities.some((e) => e.id === id));
            if (entityIds.length > 0) onDeleteEntities(entityIds);
          }}
          disabled={selectedIds.length === 0}
          style={{ fontSize: 10, padding: '2px 8px' }}
        >
          Delete
        </Button>

        <div style={{ width: 1, height: 16, background: retro.gray }} />

        <Button onClick={onCreateEntity} style={{ fontSize: 10, padding: '2px 8px' }}>
          + New
        </Button>

        <div style={{ width: 1, height: 16, background: retro.gray }} />

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={showAllItems}
            onChange={onToggleShowAll}
            style={{ cursor: 'pointer' }}
          />
          Show All
        </label>

        <div style={{ flex: 1 }} />

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

        <Select
          value={sortField}
          onChange={(value: string) => setSortField(value as SortField)}
          options={[
            { value: 'name', label: 'Name' },
            { value: 'type', label: 'Type' },
            { value: 'modifiedAt', label: 'Date Modified' },
            { value: 'createdAt', label: 'Date Added' },
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
        {sortedItems.length === 0 ? (
          <div style={{ padding: 16, color: retro.darkGray, fontSize: 12, textAlign: 'center' }}>
            Empty folder. Click "+ New" to create an entity.
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
                <th style={{ padding: '6px 8px', width: 60 }}>Type</th>
                <th style={{ padding: '6px 8px', width: 100 }}>Modified</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, i) => {
                const isSelected = selectedIds.includes(item.id);
                const isFolder = item.type === 'folder';
                return (
                  <tr
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={(e) => handleItemClick(item.id, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    style={{
                      background: isSelected ? retro.blue : i % 2 === 0 ? retro.cream : retro.white,
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
                      <span style={{ marginRight: 6 }}>{isFolder ? '📁' : '📄'}</span>
                      {item.name}
                    </td>
                    <td style={{ padding: '6px 8px' }}>{isFolder ? 'Folder' : 'Entity'}</td>
                    <td style={{ padding: '6px 8px' }}>
                      {item.type === 'entity' ? formatRelativeTime(item.data.modifiedAt) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div
            className="icon-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 8,
              padding: 8,
            }}
          >
            {sortedItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isFolder = item.type === 'folder';
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={(e) => handleItemClick(item.id, e)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                  style={{
                    padding: 8,
                    textAlign: 'center',
                    background: isSelected ? retro.blue : 'transparent',
                    color: isSelected ? retro.white : retro.black,
                    cursor: 'pointer',
                    border: '1px solid transparent',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{isFolder ? '📁' : '📄'}</div>
                  <div
                    style={{
                      fontSize: 11,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
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
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Rename Folder Modal */}
      <InputModal
        title="Rename Folder"
        label="New name:"
        defaultValue={renameModal?.name ?? ''}
        isOpen={renameModal !== null}
        onClose={() => setRenameModal(null)}
        onSubmit={handleConfirmRename}
        submitLabel="Rename"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        title={`Delete ${deleteModal?.type === 'folder' ? 'Folder' : 'Item'}`}
        message={`Are you sure you want to delete "${deleteModal?.name}"?${deleteModal?.type === 'folder' ? ' Items inside will be moved to the parent folder.' : ''}`}
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
