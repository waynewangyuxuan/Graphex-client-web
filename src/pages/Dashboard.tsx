import { useState, useEffect, useMemo } from 'react';
import type { Folder, EntitySummary } from '@/types';
import { retro } from '@/styles/retro';
import { Window, TitleBar, StatusBar } from '@/components/retro';
import { FolderTree, EntityList } from '@/components/dashboard';

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [entities, setEntities] = useState<EntitySummary[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/folders')
      .then((res) => res.json())
      .then(setFolders);

    fetch('/api/entities')
      .then((res) => res.json())
      .then(setEntities);
  }, []);

  // Get all descendant folder IDs for filtering
  const getDescendantIds = (folderId: string): string[] => {
    const children = folders.filter((f) => f.parentId === folderId);
    return children.flatMap((c) => [c.id, ...getDescendantIds(c.id)]);
  };

  // Filter entities by selected folder
  const filteredEntities = useMemo(() => {
    if (selectedFolderId === null) {
      return entities; // All items
    }
    const validIds = [selectedFolderId, ...getDescendantIds(selectedFolderId)];
    return entities.filter((e) => e.folderId && validIds.includes(e.folderId));
  }, [entities, folders, selectedFolderId]);

  const handleSelectEntity = (id: string, multi: boolean) => {
    if (multi) {
      setSelectedEntityIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedEntityIds([id]);
    }
  };

  const handleCreateFolder = (name: string, parentId: string | null) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleCreateEntity = () => {
    const title = prompt('Entity name:');
    if (title?.trim()) {
      const newEntity: EntitySummary = {
        id: `entity-${Date.now()}`,
        title: title.trim(),
        folderId: selectedFolderId,
        tags: [],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        stats: { nodeCount: 0, edgeCount: 0, pageCount: 0 },
      };
      setEntities((prev) => [...prev, newEntity]);
    }
  };

  const totalNodes = entities.reduce((sum, e) => sum + e.stats.nodeCount, 0);

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
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={handleCreateFolder}
          />

          <EntityList
            entities={filteredEntities}
            selectedIds={selectedEntityIds}
            onSelectEntity={handleSelectEntity}
            onCreateEntity={handleCreateEntity}
          />
        </div>

        <StatusBar
          segments={[
            { content: 'Ready', flex: 1 },
            { content: `${entities.length} entities` },
            { content: `${totalNodes} nodes` },
          ]}
        />
      </Window>
    </div>
  );
}
