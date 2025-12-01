import { useState, useEffect, useMemo } from 'react';
import type { Folder, EntitySummary } from '@/types';
import { retro } from '@/styles/retro';
import { Window, TitleBar, StatusBar, Modal } from '@/components/retro';
import { FolderTree, EntityList } from '@/components/dashboard';

export default function Dashboard() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [entities, setEntities] = useState<EntitySummary[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);

  // Modal state for "Move to" dialog
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [entitiesToMove, setEntitiesToMove] = useState<string[]>([]);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null>(null);

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

  // Build breadcrumb path
  const getBreadcrumbPath = (folderId: string | null): Folder[] => {
    if (!folderId) return [];
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return [];
    return [...getBreadcrumbPath(folder.parentId), folder];
  };

  // Filter entities by selected folder
  const filteredEntities = useMemo(() => {
    if (selectedFolderId === null) {
      return entities; // All items
    }
    const validIds = [selectedFolderId, ...getDescendantIds(selectedFolderId)];
    return entities.filter((e) => e.folderId && validIds.includes(e.folderId));
  }, [entities, folders, selectedFolderId]);

  // Entity handlers
  const handleSelectEntity = (id: string, multi: boolean) => {
    if (multi) {
      setSelectedEntityIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedEntityIds([id]);
    }
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

  const handleDeleteEntities = (ids: string[]) => {
    if (confirm(`Delete ${ids.length} item(s)?`)) {
      setEntities((prev) => prev.filter((e) => !ids.includes(e.id)));
      setSelectedEntityIds([]);
    }
  };

  const handleMoveEntities = (ids: string[]) => {
    setEntitiesToMove(ids);
    setMoveTargetFolderId(null);
    setMoveModalOpen(true);
  };

  const handleConfirmMove = () => {
    setEntities((prev) =>
      prev.map((e) =>
        entitiesToMove.includes(e.id) ? { ...e, folderId: moveTargetFolderId } : e
      )
    );
    setMoveModalOpen(false);
    setEntitiesToMove([]);
    setSelectedEntityIds([]);
  };

  // Folder handlers
  const handleCreateFolder = (name: string, parentId: string | null) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      parentId,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleRenameFolder = (id: string, name: string) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleDeleteFolder = (id: string) => {
    // Move entities from deleted folder to parent or root
    const folder = folders.find((f) => f.id === id);
    setEntities((prev) =>
      prev.map((e) => (e.folderId === id ? { ...e, folderId: folder?.parentId || null } : e))
    );
    // Remove folder and its children
    const descendantIds = getDescendantIds(id);
    setFolders((prev) => prev.filter((f) => f.id !== id && !descendantIds.includes(f.id)));
    if (selectedFolderId === id || descendantIds.includes(selectedFolderId || '')) {
      setSelectedFolderId(null);
    }
  };

  const handleDropEntities = (entityIds: string[], targetFolderId: string | null) => {
    setEntities((prev) =>
      prev.map((e) => (entityIds.includes(e.id) ? { ...e, folderId: targetFolderId } : e))
    );
    setSelectedEntityIds([]);
  };

  const totalNodes = entities.reduce((sum, e) => sum + e.stats.nodeCount, 0);
  const breadcrumb = getBreadcrumbPath(selectedFolderId);

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

        {/* Breadcrumb / Path bar */}
        <div
          style={{
            padding: '4px 8px',
            borderBottom: `1px solid ${retro.gray}`,
            fontSize: 11,
            color: retro.darkGray,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            onClick={() => setSelectedFolderId(null)}
            style={{
              cursor: 'pointer',
              color: selectedFolderId ? retro.blue : retro.black,
              fontWeight: selectedFolderId ? 400 : 600,
            }}
          >
            📁 Library
          </span>
          {breadcrumb.map((folder, i) => (
            <span key={folder.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: retro.darkGray }}>/</span>
              <span
                onClick={() => setSelectedFolderId(folder.id)}
                style={{
                  cursor: 'pointer',
                  color: i === breadcrumb.length - 1 ? retro.black : retro.blue,
                  fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                }}
              >
                {folder.name}
              </span>
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
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onDropEntities={handleDropEntities}
          />

          <EntityList
            entities={filteredEntities}
            selectedIds={selectedEntityIds}
            onSelectEntity={handleSelectEntity}
            onCreateEntity={handleCreateEntity}
            onDeleteEntities={handleDeleteEntities}
            onMoveEntities={handleMoveEntities}
          />
        </div>

        <StatusBar
          segments={[
            {
              content: selectedEntityIds.length > 0 ? `${selectedEntityIds.length} selected` : 'Ready',
              flex: 1,
            },
            { content: `${filteredEntities.length} items` },
            { content: `${entities.length} total` },
            { content: `${totalNodes} nodes` },
          ]}
        />
      </Window>

      {/* Move To Modal */}
      <Modal
        title="Move to..."
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        width={300}
        actions={[
          { label: 'Cancel', onClick: () => setMoveModalOpen(false) },
          { label: 'Move', onClick: handleConfirmMove, primary: true },
        ]}
      >
        <div style={{ fontSize: 12, marginBottom: 12 }}>
          Select destination folder for {entitiesToMove.length} item(s):
        </div>
        <div
          style={{
            border: `2px solid`,
            borderColor: `${retro.inset} ${retro.outset} ${retro.outset} ${retro.inset}`,
            background: retro.cream,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          <div
            onClick={() => setMoveTargetFolderId(null)}
            style={{
              padding: '6px 8px',
              cursor: 'pointer',
              background: moveTargetFolderId === null ? retro.blue : 'transparent',
              color: moveTargetFolderId === null ? retro.white : retro.black,
              fontSize: 12,
            }}
          >
            📁 Library (root)
          </div>
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => setMoveTargetFolderId(folder.id)}
              style={{
                padding: '6px 8px',
                paddingLeft: folder.parentId ? 24 : 8,
                cursor: 'pointer',
                background: moveTargetFolderId === folder.id ? retro.blue : 'transparent',
                color: moveTargetFolderId === folder.id ? retro.white : retro.black,
                fontSize: 12,
              }}
            >
              📁 {folder.name}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
