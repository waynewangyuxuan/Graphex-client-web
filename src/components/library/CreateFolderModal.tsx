import { useState } from 'react';
import { Modal } from '@/components/ui';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
}

export function CreateFolderModal({ isOpen, onClose, onSubmit }: CreateFolderModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({ name: name.trim() });

    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Folder"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            form="create-folder-form"
            disabled={!name.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Folder
          </button>
        </>
      }
    >
      <form id="create-folder-form" onSubmit={handleSubmit}>
        <label htmlFor="folder-name" className="block text-sm font-medium text-sand-700 mb-1.5">
          Folder Name <span className="text-terra-500">*</span>
        </label>
        <input
          id="folder-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); }}
          placeholder="Enter folder name..."
          className="input w-full"
          autoFocus
        />
      </form>
    </Modal>
  );
}
