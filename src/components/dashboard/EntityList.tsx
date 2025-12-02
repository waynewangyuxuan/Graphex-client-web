import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EntitySummary, Folder, FileItem } from '@/types';
import { cyber } from '@/styles/cyber';
import { Inset, ContextMenu, InputModal, ConfirmModal } from '@/components/cyber';
import { useInlineEdit, useContextMenu } from '@/hooks';
import { FileToolbar } from './FileToolbar';
import { FileListItem } from './FileListItem';
import { FileGridItem } from './FileGridItem';

type ViewMode = 'list' | 'icon';
type SortField = 'name' | 'modifiedAt' | 'createdAt' | 'type';
type SortOrder = 'asc' | 'desc';

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
  onRenameEntity: (id: string, title: string) => void;
  onDeleteFolder: (id: string) => void;
  onDragStart?: (ids: string[], type: 'entity' | 'folder') => void;
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
  onRenameEntity,
  onDeleteFolder,
  onDragStart,
}: EntityListProps) {
  const navigate = useNavigate();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Hooks
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const {
    editingItem,
    editingValue,
    setEditingValue,
    startEditing,
    saveEditing,
    handleEditKeyDown,
  } = useInlineEdit({ onRenameFolder, onRenameEntity });

  // Modal state
  const [renameModal, setRenameModal] = useState<{ id: string; name: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    entityIds: string[];
    folderIds: string[];
  } | null>(null);

  // Combine folders and entities into a single list
  const items: FileItem[] = useMemo(
    () => [
      ...folders.map((f): FileItem => ({ type: 'folder', id: f.id, name: f.name, data: f })),
      ...entities.map((e): FileItem => ({ type: 'entity', id: e.id, name: e.title, data: e })),
    ],
    [folders, entities]
  );

  // Sort items
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'type':
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
  }, [items, sortField, sortOrder]);

  // Handlers
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
    if (!selectedIds.includes(item.id)) {
      onSelectItem(item.id, false);
    }
    openContextMenu(e, item.type, item.id);
  };

  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('table, .icon-grid') === null) {
      openContextMenu(e, 'empty');
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

  const handleToolbarMove = () => {
    const entityIds = selectedIds.filter((id) => entities.some((e) => e.id === id));
    if (entityIds.length > 0) onMoveItems(entityIds);
  };

  const handleToolbarDelete = () => {
    const entityIds = selectedIds.filter((id) => entities.some((e) => e.id === id));
    const folderIds = selectedIds.filter((id) => folders.some((f) => f.id === id));
    if (entityIds.length > 0 || folderIds.length > 0) {
      setDeleteModal({ entityIds, folderIds });
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

  const handleConfirmRename = (newName: string) => {
    if (renameModal) {
      onRenameFolder(renameModal.id, newName);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteModal) {
      if (deleteModal.entityIds.length > 0) {
        onDeleteEntities(deleteModal.entityIds);
      }
      deleteModal.folderIds.forEach((id) => onDeleteFolder(id));
      setDeleteModal(null);
    }
  };

  // Context menu items builder
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
            if (folder) {
              const item = items.find((i) => i.id === folder.id);
              if (item) startEditing(item);
            }
          },
        },
        { label: '', onClick: () => {}, divider: true },
        {
          label: 'Delete',
          onClick: () => {
            if (folder) setDeleteModal({ entityIds: [], folderIds: [folder.id] });
          },
        },
      ];
    }

    // Entity context menu
    const selectedEntities = selectedIds.filter((id) => entities.some((e) => e.id === id));
    const entity = entities.find((e) => e.id === contextMenu?.itemId);
    return [
      { label: 'Open', onClick: handleOpen, disabled: selectedIds.length !== 1 },
      { label: '', onClick: () => {}, divider: true },
      {
        label: 'Rename',
        onClick: () => {
          if (entity) {
            const item = items.find((i) => i.id === entity.id);
            if (item) startEditing(item);
          }
        },
        disabled: selectedIds.length !== 1,
      },
      { label: 'Move to...', onClick: () => onMoveItems(selectedEntities) },
      { label: '', onClick: () => {}, divider: true },
      {
        label: `Delete${selectedEntities.length > 1 ? ` (${selectedEntities.length})` : ''}`,
        onClick: () => setDeleteModal({ entityIds: selectedEntities, folderIds: [] }),
      },
    ];
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Section Header */}
      <div
        style={{
          background: cyber.black,
          padding: '8px 12px',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: cyber.fontDisplay,
          textTransform: 'uppercase',
          color: cyber.white,
          borderBottom: cyber.border,
        }}
      >
        ═ {currentFolderName ? currentFolderName.toUpperCase() : 'HOME'}
        {showAllItems ? ' (ALL)' : ''} ═
      </div>

      {/* Toolbar */}
      <FileToolbar
        hasSelection={selectedIds.length > 0}
        showAllItems={showAllItems}
        viewMode={viewMode}
        sortField={sortField}
        sortOrder={sortOrder}
        onOpen={handleOpen}
        onMove={handleToolbarMove}
        onDelete={handleToolbarDelete}
        onCreateEntity={onCreateEntity}
        onToggleShowAll={onToggleShowAll}
        onViewModeChange={setViewMode}
        onSortFieldChange={setSortField}
        onSortOrderToggle={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
      />

      {/* Content area */}
      <Inset style={{ flex: 1, margin: 4, overflow: 'auto' }} onContextMenu={handleEmptySpaceContextMenu}>
        {sortedItems.length === 0 ? (
          <div style={{ padding: 16, color: cyber.darkGray, fontSize: 12, textAlign: 'center' }}>
            Empty folder. Click "+ New" to create an entity.
          </div>
        ) : viewMode === 'list' ? (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              fontFamily: cyber.fontDisplay,
            }}
          >
            <thead>
              <tr style={{ background: cyber.gray, textAlign: 'left' }}>
                <th style={{ padding: '6px 8px', width: 30 }}></th>
                <th style={{ padding: '6px 8px' }}>Name</th>
                <th style={{ padding: '6px 8px', width: 60 }}>Type</th>
                <th style={{ padding: '6px 8px', width: 100 }}>Modified</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, i) => (
                <FileListItem
                  key={item.id}
                  item={item}
                  index={i}
                  isSelected={selectedIds.includes(item.id)}
                  isEditing={editingItem?.id === item.id}
                  editingValue={editingValue}
                  onEditChange={setEditingValue}
                  onEditKeyDown={handleEditKeyDown}
                  onEditSave={saveEditing}
                  onClick={(e) => handleItemClick(item.id, e)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onStartEditing={() => startEditing(item)}
                />
              ))}
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
            {sortedItems.map((item) => (
              <FileGridItem
                key={item.id}
                item={item}
                isSelected={selectedIds.includes(item.id)}
                isEditing={editingItem?.id === item.id}
                editingValue={editingValue}
                onEditChange={setEditingValue}
                onEditKeyDown={handleEditKeyDown}
                onEditSave={saveEditing}
                onClick={(e) => handleItemClick(item.id, e)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                onContextMenu={(e) => handleContextMenu(e, item)}
                onDragStart={(e) => handleDragStart(e, item)}
                onStartEditing={() => startEditing(item)}
              />
            ))}
          </div>
        )}
      </Inset>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
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
        title="Delete Items"
        message={(() => {
          if (!deleteModal) return '';
          const totalCount = deleteModal.entityIds.length + deleteModal.folderIds.length;
          const hasFolders = deleteModal.folderIds.length > 0;
          return `Are you sure you want to delete ${totalCount} item(s)?${hasFolders ? ' Items inside folders will be moved to the parent folder.' : ''} This action cannot be undone.`;
        })()}
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
