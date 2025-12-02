import { useState, useCallback } from 'react';

interface EditingItem {
  id: string;
  type: 'folder' | 'entity';
}

interface UseInlineEditOptions {
  onRenameFolder: (id: string, name: string) => void;
  onRenameEntity: (id: string, title: string) => void;
}

interface UseInlineEditReturn {
  editingItem: EditingItem | null;
  editingValue: string;
  setEditingValue: (value: string) => void;
  startEditing: (item: { id: string; type: 'folder' | 'entity'; name: string }) => void;
  saveEditing: () => void;
  cancelEditing: () => void;
  handleEditKeyDown: (e: React.KeyboardEvent) => void;
}

export function useInlineEdit({
  onRenameFolder,
  onRenameEntity,
}: UseInlineEditOptions): UseInlineEditReturn {
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const startEditing = useCallback(
    (item: { id: string; type: 'folder' | 'entity'; name: string }) => {
      setEditingItem({ id: item.id, type: item.type });
      setEditingValue(item.name);
    },
    []
  );

  const cancelEditing = useCallback(() => {
    setEditingItem(null);
    setEditingValue('');
  }, []);

  const saveEditing = useCallback(() => {
    if (editingItem && editingValue.trim()) {
      if (editingItem.type === 'folder') {
        onRenameFolder(editingItem.id, editingValue.trim());
      } else {
        onRenameEntity(editingItem.id, editingValue.trim());
      }
    }
    setEditingItem(null);
    setEditingValue('');
  }, [editingItem, editingValue, onRenameFolder, onRenameEntity]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEditing();
      } else if (e.key === 'Escape') {
        cancelEditing();
      }
    },
    [saveEditing, cancelEditing]
  );

  return {
    editingItem,
    editingValue,
    setEditingValue,
    startEditing,
    saveEditing,
    cancelEditing,
    handleEditKeyDown,
  };
}
