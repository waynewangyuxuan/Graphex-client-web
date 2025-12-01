import { useState } from 'react';
import type { Folder } from '@/types';
import { retro } from '@/styles/retro';
import { Inset, Button, SectionHeader, ContextMenu } from '@/components/retro';

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDropEntities: (entityIds: string[], folderId: string | null) => void;
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onDropEntities,
}: FolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    folderId: string | null;
  } | null>(null);

  const toggleExpand = (folderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleNewFolder = () => {
    const name = prompt('Folder name:');
    if (name?.trim()) {
      onCreateFolder(name.trim(), selectedFolderId);
    }
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverId(null);
    const data = e.dataTransfer.getData('entityIds');
    if (data) {
      const entityIds = JSON.parse(data) as string[];
      onDropEntities(entityIds, folderId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, folderId: string | null) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, folderId });
  };

  // Build tree structure
  const rootFolders = folders.filter((f) => f.parentId === null);
  const getChildren = (parentId: string) => folders.filter((f) => f.parentId === parentId);
  const hasChildren = (folderId: string) => folders.some((f) => f.parentId === folderId);

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const isExpanded = expandedIds.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isDragOver = dragOverId === folder.id;
    const children = getChildren(folder.id);
    const hasKids = hasChildren(folder.id);

    return (
      <div key={folder.id}>
        <div
          onClick={() => onSelectFolder(folder.id)}
          onContextMenu={(e) => handleContextMenu(e, folder.id)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
          style={{
            padding: '4px 8px',
            paddingLeft: 8 + depth * 16,
            cursor: 'pointer',
            background: isDragOver ? retro.highlight : isSelected ? retro.blue : 'transparent',
            color: isSelected && !isDragOver ? retro.white : retro.black,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            border: isDragOver ? `1px dashed ${retro.amber}` : '1px solid transparent',
          }}
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (hasKids) toggleExpand(folder.id);
            }}
            style={{
              width: 12,
              cursor: hasKids ? 'pointer' : 'default',
              color: isSelected && !isDragOver ? retro.white : retro.darkGray,
            }}
          >
            {hasKids ? (isExpanded ? '▼' : '▶') : ''}
          </span>
          <span>📁</span>
          <span>{folder.name}</span>
        </div>
        {isExpanded && children.map((child) => renderFolder(child, depth + 1))}
      </div>
    );
  };

  const isAllSelected = selectedFolderId === null;
  const isAllDragOver = dragOverId === 'all';

  const contextMenuItems = contextMenu?.folderId
    ? [
        {
          label: 'New Subfolder',
          onClick: () => {
            const name = prompt('Folder name:');
            if (name?.trim()) onCreateFolder(name.trim(), contextMenu.folderId);
          },
        },
        {
          label: 'Rename',
          onClick: () => {
            const folder = folders.find((f) => f.id === contextMenu.folderId);
            const name = prompt('New name:', folder?.name);
            if (name?.trim() && contextMenu.folderId) {
              onRenameFolder(contextMenu.folderId, name.trim());
            }
          },
        },
        { label: '', onClick: () => {}, divider: true },
        {
          label: 'Delete',
          onClick: () => {
            if (contextMenu.folderId && confirm('Delete this folder?')) {
              onDeleteFolder(contextMenu.folderId);
            }
          },
        },
      ]
    : [
        {
          label: 'New Folder',
          onClick: () => {
            const name = prompt('Folder name:');
            if (name?.trim()) onCreateFolder(name.trim(), null);
          },
        },
      ];

  return (
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
        {/* All Items */}
        <div
          onClick={() => onSelectFolder(null)}
          onContextMenu={(e) => handleContextMenu(e, null)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverId('all');
          }}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, null)}
          style={{
            padding: '4px 8px',
            cursor: 'pointer',
            background: isAllDragOver ? retro.highlight : isAllSelected ? retro.blue : 'transparent',
            color: isAllSelected && !isAllDragOver ? retro.white : retro.black,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            border: isAllDragOver ? `1px dashed ${retro.amber}` : '1px solid transparent',
          }}
        >
          <span style={{ width: 12 }}>◆</span>
          <span>All Items</span>
        </div>

        {/* Folder tree */}
        {rootFolders.map((folder) => renderFolder(folder))}
      </Inset>
      <div style={{ padding: 4 }}>
        <Button onClick={handleNewFolder} style={{ width: '100%', fontSize: 11 }}>
          + New Folder
        </Button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
