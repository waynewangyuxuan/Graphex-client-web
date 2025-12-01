import { useState } from 'react';
import type { Folder } from '@/types';
import { retro } from '@/styles/retro';
import { Inset, Button, SectionHeader } from '@/components/retro';

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
}: FolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
      onCreateFolder(name.trim(), null);
    }
  };

  // Build tree structure
  const rootFolders = folders.filter((f) => f.parentId === null);
  const getChildren = (parentId: string) => folders.filter((f) => f.parentId === parentId);
  const hasChildren = (folderId: string) => folders.some((f) => f.parentId === folderId);

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const isExpanded = expandedIds.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const children = getChildren(folder.id);
    const hasKids = hasChildren(folder.id);

    return (
      <div key={folder.id}>
        <div
          onClick={() => onSelectFolder(folder.id)}
          style={{
            padding: '4px 8px',
            paddingLeft: 8 + depth * 16,
            cursor: 'pointer',
            background: isSelected ? retro.blue : 'transparent',
            color: isSelected ? retro.white : retro.black,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
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
              color: isSelected ? retro.white : retro.darkGray,
            }}
          >
            {hasKids ? (isExpanded ? '▼' : '▶') : ''}
          </span>
          <span>{folder.name}</span>
        </div>
        {isExpanded && children.map((child) => renderFolder(child, depth + 1))}
      </div>
    );
  };

  const isAllSelected = selectedFolderId === null;

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
          style={{
            padding: '4px 8px',
            cursor: 'pointer',
            background: isAllSelected ? retro.blue : 'transparent',
            color: isAllSelected ? retro.white : retro.black,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
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
    </div>
  );
}
