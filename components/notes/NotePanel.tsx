/**
 * NotePanel Component
 *
 * Persistent panel for note-taking that appears in the bottom-left corner.
 * Shows when a node is clicked and allows users to take notes without
 * overlaying the graph or reading panel.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { useNodeNotes } from '@/hooks/useNotes';
import { useAutoSave } from '@/hooks/useAutoSave';
import { NoteContent } from './NoteContent';
import { SaveStatus } from './SaveStatus';
import { cn } from '@/lib/utils';

export interface NotePanelProps {
  /** Whether the panel is visible */
  isVisible: boolean;
  /** Close/hide handler */
  onClose: () => void;
  /** Graph ID */
  graphId: string;
  /** Node ID */
  nodeId: string | null;
  /** Node title */
  nodeTitle: string | null;
}

/**
 * Persistent note-taking panel
 *
 * Fixed panel in bottom-left corner for taking notes on graph nodes.
 * Features auto-save, minimize/maximize, and delete functionality.
 */
export function NotePanel({
  isVisible,
  onClose,
  graphId,
  nodeId,
  nodeTitle,
}: NotePanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [content, setContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch existing notes for this node
  const {
    notes,
    isLoading,
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
    hasNotes,
    isCreating,
    isUpdating,
    isDeleting,
  } = useNodeNotes(graphId, nodeId);

  // Only render when a node is selected and panel is visible
  const isActive = isVisible && !!nodeId;

  const existingNote = notes[0];

  // Initialize content when node changes or note loads
  useEffect(() => {
    if (existingNote) {
      setContent(existingNote.content);
    } else {
      setContent('');
    }
    setSaveError(null);
    setShowDeleteConfirm(false);
  }, [nodeId, existingNote?.id, existingNote?.content]);

  // Auto-save setup
  const handleSave = async (contentToSave: string) => {
    try {
      setSaveError(null);
      if (!nodeId) return; // Safety: shouldn't happen when inactive
      if (existingNote) {
        await updateNoteMutation.mutateAsync({
          noteId: existingNote.id,
          graphId,
          content: contentToSave,
        });
      } else {
        await createNoteMutation.mutateAsync({
          graphId,
          nodeId: nodeId as string,
          content: contentToSave,
        });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save note'
      );
      throw error;
    }
  };

  const {
    isSaving: isAutoSaving,
    lastSaved,
    saveNow,
  } = useAutoSave(content, {
    onSave: handleSave,
    delay: 1000,
    enabled: isActive,
  });

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!existingNote) return;

    try {
      await deleteNoteMutation.mutateAsync({
        noteId: existingNote.id,
        graphId,
      });
      setContent('');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete note:', error);
      setSaveError(
        error instanceof Error ? error.message : 'Failed to delete note'
      );
    }
  };

  const isSaving = isAutoSaving || isCreating || isUpdating;

  if (!isActive) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 left-6 z-40 bg-chrome rounded-lg shadow-2xl border border-gray-300',
        'transition-all duration-300 ease-in-out',
        isMinimized ? 'w-80 h-14' : 'w-96 h-80'
      )}
      role="complementary"
      aria-label="Note panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg
            className="w-4 h-4 text-primary flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {nodeTitle || 'Note'}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {/* Save Status */}
          {!isMinimized && (
            <SaveStatus
              isSaving={isSaving}
              lastSaved={lastSaved}
              error={saveError}
              onRetry={saveNow}
            />
          )}

          {/* Minimize/Maximize */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-200 rounded transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-200 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content - only visible when not minimized */}
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-3.5rem)]">
          {/* Note Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <NoteContent
                value={content}
                onChange={handleContentChange}
                placeholder={`Add your thoughts about "${nodeTitle}"...`}
                disabled={isSaving || isDeleting}
              />
            )}
          </div>

          {/* Footer - Delete button */}
          {hasNotes && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              {showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Delete this note?
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="w-full justify-start text-error hover:text-error hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Note
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
