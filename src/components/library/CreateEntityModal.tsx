import { useState } from 'react';
import { Modal } from '@/components/ui';
import type { Folder } from '@/api';

interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; folderId: string | null; tags: string[] }) => void;
  folders: Folder[];
}

export function CreateEntityModal({ isOpen, onClose, onSubmit, folders }: CreateEntityModalProps) {
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      folderId,
      tags,
    });

    // Reset form
    setTitle('');
    setFolderId(null);
    setTagInput('');
    setTags([]);
    onClose();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Entity"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            form="create-entity-form"
            disabled={!title.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Entity
          </button>
        </>
      }
    >
      <form id="create-entity-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="entity-title" className="block text-sm font-medium text-sand-700 mb-1.5">
            Title <span className="text-terra-500">*</span>
          </label>
          <input
            id="entity-title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); }}
            placeholder="Enter entity title..."
            className="input w-full"
            autoFocus
          />
        </div>

        {/* Folder */}
        <div>
          <label htmlFor="entity-folder" className="block text-sm font-medium text-sand-700 mb-1.5">
            Folder
          </label>
          <select
            id="entity-folder"
            value={folderId ?? ''}
            onChange={(e) => { setFolderId(e.target.value || null); }}
            className="input w-full"
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="entity-tags" className="block text-sm font-medium text-sand-700 mb-1.5">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              id="entity-tags"
              type="text"
              value={tagInput}
              onChange={(e) => { setTagInput(e.target.value); }}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag..."
              className="input flex-1"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              className="btn-secondary px-3 disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-terra-100 text-terra-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => { handleRemoveTag(tag); }}
                    className="hover:text-terra-900"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
