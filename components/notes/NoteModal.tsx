/**
 * NoteModal Component
 *
 * Modal for creating and editing notes on graph nodes.
 * Features auto-save with debouncing, save status indicator, and delete confirmation.
 *
 * @example
 * ```tsx
 * <NoteModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   graphId="graph_abc123"
 *   nodeId="node_1"
 *   nodeTitle="Introduction to React"
 * />
 * ```
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useNodeNotes } from '@/hooks/useNotes';
import { useAutoSave } from '@/hooks/useAutoSave';
import { NoteContent } from './NoteContent';
import { SaveStatus } from './SaveStatus';
import { cn } from '@/lib/utils';

export interface NoteModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Close handler
   */
  onClose: () => void;
  /**
   * Graph ID
   */
  graphId: string;
  /**
   * Node ID (for node notes)
   */
  nodeId?: string;
  /**
   * Edge ID (for edge notes - Feature 6)
   */
  edgeId?: string;
  /**
   * Title to display (node or edge title)
   */
  nodeTitle?: string;
}

/**
 * Note modal with auto-save functionality
 *
 * Provides a modal interface for creating and editing notes on graph nodes.
 * Features automatic saving with debouncing, status indicators, and delete confirmation.
 */
export function NoteModal({
  isOpen,
  onClose,
  graphId,
  nodeId,
  edgeId,
  nodeTitle,
}: NoteModalProps) {
  // For MVP, we only support node notes
  if (!nodeId) {
    console.warn('NoteModal: nodeId is required for MVP');
    return null;
  }

  // Fetch existing notes for this node
  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    hasNotes,
    isCreating,
    isUpdating,
    isDeleting,
  } = useNodeNotes(graphId, nodeId);

  // Local state for content editing
  const [content, setContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Get the first note (MVP: one note per node)
  const existingNote = notes[0];

  // Initialize content when modal opens or note loads
  useEffect(() => {
    if (isOpen && existingNote) {
      setContent(existingNote.content);
    } else if (isOpen && !existingNote) {
      setContent('');
    }
  }, [isOpen, existingNote]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setSaveError(null);
    }
  }, [isOpen]);

  // Auto-save handler
  const handleAutoSave = (contentToSave: string) => {
    try {
      if (existingNote) {
        // Update existing note
        updateNote(existingNote.id, contentToSave);
      } else if (contentToSave.trim().length > 0) {
        // Create new note
        createNote(contentToSave);
      }
      setSaveError(null);
    } catch (error) {
      setSaveError('Failed to save note');
      console.error('Auto-save error:', error);
    }
  };

  // Auto-save hook
  const { isSaving, lastSaved, saveNow } = useAutoSave(content, {
    onSave: handleAutoSave,
    delay: 2000,
    enabled: isOpen && content.trim().length > 0,
    minLength: 1,
  });

  // Delete handler
  const handleDelete = () => {
    if (!existingNote) return;

    deleteNote(existingNote.id);
    setContent('');
    setShowDeleteConfirm(false);
    onClose();
  };

  // Close handler with save prompt if needed
  const handleClose = () => {
    // If there are unsaved changes, save before closing
    if (content !== existingNote?.content && content.trim().length > 0) {
      saveNow();
    }
    onClose();
  };

  const isMutating = isCreating || isUpdating || isDeleting;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>
            {hasNotes ? 'Edit Note' : 'Add Note'}
          </Dialog.Title>
          <Dialog.Description>
            {nodeTitle ? (
              <>
                <span className="font-medium text-text-primary">
                  {nodeTitle}
                </span>
                {' — '}
                Write notes to capture your understanding of this concept.
              </>
            ) : (
              'Write notes to capture your understanding of this concept.'
            )}
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Body>
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="sr-only">Loading note...</span>
            </div>
          )}

          {/* Note content */}
          {!isLoading && (
            <div className="space-y-4">
              {/* Save status indicator */}
              <div className="flex justify-end">
                <SaveStatus
                  isSaving={isSaving || isMutating}
                  lastSaved={lastSaved}
                  error={saveError}
                  onRetry={saveNow}
                />
              </div>

              {/* Textarea */}
              <NoteContent
                value={content}
                onChange={setContent}
                maxLength={2000}
                autoFocus
                disabled={isMutating}
              />
            </div>
          )}
        </Dialog.Body>

        <Dialog.Footer>
          {/* Delete button (only if note exists) */}
          {hasNotes && !showDeleteConfirm && (
            <Button
              variant="error"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isMutating}
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="mr-auto"
            >
              Delete
            </Button>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mr-auto flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                Delete this note?
              </span>
              <Button
                variant="error"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Close button */}
          {!showDeleteConfirm && (
            <Button
              variant="primary"
              onClick={handleClose}
              disabled={isMutating}
            >
              Done
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
