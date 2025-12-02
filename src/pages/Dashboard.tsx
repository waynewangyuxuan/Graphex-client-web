import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Folder, EntitySummary } from '@/types';
import { cyber } from '@/styles/cyber';
import { Button, InputModal, ConfirmModal } from '@/components/cyber';

export default function Dashboard() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [entities, setEntities] = useState<EntitySummary[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Modal state
  const [newEntityModalOpen, setNewEntityModalOpen] = useState(false);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'entity' | 'folder'; id: string } | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/folders').then((res) => res.json()).then(setFolders);
    fetch('/api/entities').then((res) => res.json()).then(setEntities);
  }, []);

  // Get subfolders of current folder
  const subfolders = useMemo(
    () => folders.filter((f) => f.parentId === selectedFolderId),
    [folders, selectedFolderId]
  );

  // Get entities in current folder
  const currentEntities = useMemo(
    () => entities.filter((e) => e.folderId === selectedFolderId),
    [entities, selectedFolderId]
  );

  // Get current folder
  const currentFolder = folders.find((f) => f.id === selectedFolderId);

  // Handlers
  const handleCreateEntity = (title: string) => {
    const newEntity: EntitySummary = {
      id: `entity-${Date.now()}`,
      title,
      folderId: selectedFolderId,
      tags: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      stats: { nodeCount: 0, edgeCount: 0, pageCount: 0 },
    };
    setEntities((prev) => [...prev, newEntity]);
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      parentId: selectedFolderId,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'entity') {
      setEntities((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    } else {
      // Move entities to parent, delete folder
      const folder = folders.find((f) => f.id === deleteTarget.id);
      setEntities((prev) =>
        prev.map((e) => (e.folderId === deleteTarget.id ? { ...e, folderId: folder?.parentId || null } : e))
      );
      setFolders((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: cyber.concrete,
        fontFamily: cyber.fontBody,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: cyber.border,
          background: cyber.white,
        }}
      >
        <span
          style={{
            fontFamily: cyber.fontDisplay,
            fontWeight: 700,
            fontSize: 14,
            textTransform: 'uppercase',
            flex: 1,
          }}
        >
          GRAPHEX
        </span>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
          }}
          title="Settings"
        >
          ⚙
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {selectedFolderId && (
            <Button onClick={() => setSelectedFolderId(currentFolder?.parentId || null)}>
              ← Back
            </Button>
          )}
          <Button onClick={() => setNewEntityModalOpen(true)}>+ Entity</Button>
          <Button onClick={() => setNewFolderModalOpen(true)}>+ Folder</Button>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {/* Folders */}
          {subfolders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              style={{
                padding: 16,
                background: cyber.white,
                border: cyber.border,
                cursor: 'pointer',
                fontFamily: cyber.fontDisplay,
                textTransform: 'uppercase',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>📁</span>
              <span style={{ flex: 1 }}>{folder.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget({ type: 'folder', id: folder.id });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  opacity: 0.5,
                }}
              >
                ×
              </button>
            </div>
          ))}

          {/* Entities */}
          {currentEntities.map((entity) => (
            <div
              key={entity.id}
              onClick={() => navigate(`/entity/${entity.id}`)}
              style={{
                padding: 16,
                background: cyber.white,
                border: cyber.border,
                boxShadow: cyber.shadow,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  fontFamily: cyber.fontDisplay,
                  textTransform: 'uppercase',
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ flex: 1 }}>{entity.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ type: 'entity', id: entity.id });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    opacity: 0.5,
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ fontSize: 11, color: cyber.darkGray }}>
                {entity.stats.nodeCount} nodes · {entity.stats.pageCount} pages
              </div>
            </div>
          ))}

          {/* Empty state */}
          {subfolders.length === 0 && currentEntities.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: 48,
                textAlign: 'center',
                color: cyber.darkGray,
                fontSize: 12,
                fontFamily: cyber.fontDisplay,
                textTransform: 'uppercase',
              }}
            >
              Empty. Create an entity or folder to get started.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <InputModal
        title="New Entity"
        label="Name:"
        placeholder="Enter entity name"
        isOpen={newEntityModalOpen}
        onClose={() => setNewEntityModalOpen(false)}
        onSubmit={handleCreateEntity}
        submitLabel="Create"
      />

      <InputModal
        title="New Folder"
        label="Name:"
        placeholder="Enter folder name"
        isOpen={newFolderModalOpen}
        onClose={() => setNewFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
        submitLabel="Create"
      />

      <ConfirmModal
        title="Delete"
        message={`Delete this ${deleteTarget?.type}? ${deleteTarget?.type === 'folder' ? 'Items inside will be moved to parent.' : ''}`}
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
