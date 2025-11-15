/**
 * Notes React Query Hooks
 *
 * React Query hooks for note operations:
 * - useNotes: Fetch all notes for a graph
 * - useCreateNote: Create note mutation
 * - useUpdateNote: Update note mutation
 * - useDeleteNote: Delete note mutation
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '@/lib/api/notes';
import type {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
} from '@/types/api.types';
import type { NormalizedAPIError } from '@/lib/api-client';

// ============================================================================
// Query Keys
// ============================================================================

/**
 * Query key factory for note-related queries
 */
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (graphId: string) => [...noteKeys.lists(), graphId] as const,
  byNode: (graphId: string, nodeId: string) => [...noteKeys.list(graphId), 'node', nodeId] as const,
  byEdge: (graphId: string, edgeId: string) => [...noteKeys.list(graphId), 'edge', edgeId] as const,
};

// ============================================================================
// useNotes - Fetch Notes for Graph
// ============================================================================

/**
 * Fetch all notes for a graph
 *
 * Returns all notes attached to the graph, its nodes, and its edges.
 * Use the `select` option to filter by nodeId or edgeId if needed.
 *
 * @param graphId - Graph ID
 * @param options - React Query options
 * @returns Query result with array of notes
 *
 * @example
 * ```typescript
 * // Get all notes
 * const { data: notes, isLoading } = useNotes('graph_abc123');
 *
 * // Filter for specific node using select
 * const { data: nodeNotes } = useNotes('graph_abc123', {
 *   select: (notes) => notes.filter(note => note.nodeId === 'node_1')
 * });
 *
 * // Filter for edges only
 * const { data: edgeNotes } = useNotes('graph_abc123', {
 *   select: (notes) => notes.filter(note => note.edgeId !== null)
 * });
 *
 * if (isLoading) return <Spinner />;
 * return <NotesList notes={notes} />;
 * ```
 */
export function useNotes(
  graphId: string,
  options?: Omit<
    UseQueryOptions<Note[], NormalizedAPIError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Note[], NormalizedAPIError>({
    queryKey: noteKeys.list(graphId),
    queryFn: () => getNotes(graphId),
    enabled: !!graphId,
    staleTime: 2 * 60 * 1000, // 2 minutes - notes may change frequently
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 404
    ...options,
  });
}

// ============================================================================
// useCreateNote - Create Note Mutation
// ============================================================================

/**
 * Create new note mutation
 *
 * Optimistically updates the cache and invalidates queries on success.
 *
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * const createNoteMutation = useCreateNote({
 *   onSuccess: () => {
 *     toast.success('Note saved');
 *     closeModal();
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleSave = (content: string) => {
 *   createNoteMutation.mutate({
 *     graphId: 'graph_abc123',
 *     nodeId: 'node_1',
 *     content
 *   });
 * };
 *
 * return (
 *   <form onSubmit={(e) => {
 *     e.preventDefault();
 *     handleSave(e.target.content.value);
 *   }}>
 *     <textarea name="content" />
 *     <button disabled={createNoteMutation.isLoading}>
 *       {createNoteMutation.isLoading ? 'Saving...' : 'Save Note'}
 *     </button>
 *   </form>
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Optimistic update with loading state
 * const createNoteMutation = useCreateNote();
 *
 * const handleQuickNote = async (nodeId: string, content: string) => {
 *   try {
 *     const note = await createNoteMutation.mutateAsync({
 *       graphId: currentGraphId,
 *       nodeId,
 *       content
 *     });
 *     console.log('Note created:', note.id);
 *   } catch (error) {
 *     console.error('Failed to create note:', error);
 *   }
 * };
 * ```
 */
export function useCreateNote(
  options?: UseMutationOptions<
    Note,
    NormalizedAPIError,
    NoteCreateRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    Note,
    NormalizedAPIError,
    NoteCreateRequest,
    { previousNotes: Note[] | undefined }
  >({
    mutationFn: (request) => createNote(request),
    onMutate: async (newNote) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: noteKeys.list(newNote.graphId) });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData<Note[]>(
        noteKeys.list(newNote.graphId)
      );

      // Optimistically update cache with temporary note
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          noteKeys.list(newNote.graphId),
          [...previousNotes, {
            id: `temp_${Date.now()}`, // Temporary ID
            graphId: newNote.graphId,
            nodeId: newNote.nodeId || null,
            edgeId: newNote.edgeId || null,
            content: newNote.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }]
        );
      }

      // Return context for rollback
      return { previousNotes };
    },
    onError: (error, newNote, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(
          noteKeys.list(newNote.graphId),
          context.previousNotes
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: noteKeys.list(variables.graphId) });
    },
    retry: false, // Don't retry note creation
    ...options,
  });
}

// ============================================================================
// useUpdateNote - Update Note Mutation
// ============================================================================

/**
 * Update note mutation
 *
 * Optimistically updates the cache and invalidates queries on success.
 *
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * const [editingNote, setEditingNote] = useState<Note | null>(null);
 * const updateNoteMutation = useUpdateNote({
 *   onSuccess: () => {
 *     toast.success('Note updated');
 *     setEditingNote(null);
 *   }
 * });
 *
 * const handleUpdate = (noteId: string, content: string) => {
 *   updateNoteMutation.mutate({
 *     noteId,
 *     graphId: currentGraphId,
 *     content
 *   });
 * };
 *
 * return (
 *   <div>
 *     {editingNote && (
 *       <NoteEditor
 *         note={editingNote}
 *         onSave={(content) => handleUpdate(editingNote.id, content)}
 *         isSaving={updateNoteMutation.isLoading}
 *       />
 *     )}
 *   </div>
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Auto-save with debounce
 * const updateNoteMutation = useUpdateNote();
 * const debouncedUpdate = useMemo(
 *   () => debounce((noteId: string, graphId: string, content: string) => {
 *     updateNoteMutation.mutate({ noteId, graphId, content });
 *   }, 1000),
 *   []
 * );
 *
 * const handleContentChange = (content: string) => {
 *   setLocalContent(content);
 *   debouncedUpdate(note.id, note.graphId, content);
 * };
 * ```
 */
export function useUpdateNote(
  options?: UseMutationOptions<
    Note,
    NormalizedAPIError,
    { noteId: string; graphId: string; content: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    Note,
    NormalizedAPIError,
    { noteId: string; graphId: string; content: string },
    { previousNotes: Note[] | undefined }
  >({
    mutationFn: ({ noteId, content }) => updateNote(noteId, { content }),
    onMutate: async ({ noteId, graphId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.list(graphId) });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData<Note[]>(
        noteKeys.list(graphId)
      );

      // Optimistically update cache
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          noteKeys.list(graphId),
          previousNotes.map(note =>
            note.id === noteId
              ? { ...note, content, updatedAt: new Date().toISOString() }
              : note
          )
        );
      }

      // Return context for rollback
      return { previousNotes };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(
          noteKeys.list(variables.graphId),
          context.previousNotes
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: noteKeys.list(variables.graphId) });
    },
    retry: false, // Don't retry updates
    ...options,
  });
}

// ============================================================================
// useDeleteNote - Delete Note Mutation
// ============================================================================

/**
 * Delete note mutation
 *
 * Optimistically removes from cache and invalidates queries on success.
 *
 * @param options - React Query mutation options
 * @returns Mutation function and state
 *
 * @example
 * ```typescript
 * const deleteNoteMutation = useDeleteNote({
 *   onSuccess: () => {
 *     toast.success('Note deleted');
 *   },
 *   onError: (error) => {
 *     toast.error('Failed to delete note');
 *   }
 * });
 *
 * const handleDelete = (noteId: string) => {
 *   if (confirm('Delete this note?')) {
 *     deleteNoteMutation.mutate({
 *       noteId,
 *       graphId: currentGraphId
 *     });
 *   }
 * };
 *
 * return (
 *   <button
 *     onClick={() => handleDelete(note.id)}
 *     disabled={deleteNoteMutation.isLoading}
 *   >
 *     Delete
 *   </button>
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Delete with undo functionality
 * const deleteNoteMutation = useDeleteNote();
 * const [deletedNote, setDeletedNote] = useState<Note | null>(null);
 *
 * const handleDelete = (note: Note) => {
 *   setDeletedNote(note);
 *   deleteNoteMutation.mutate(
 *     { noteId: note.id, graphId: note.graphId },
 *     {
 *       onSuccess: () => {
 *         toast.success('Note deleted', {
 *           action: {
 *             label: 'Undo',
 *             onClick: () => handleUndo(note)
 *           }
 *         });
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useDeleteNote(
  options?: UseMutationOptions<
    void,
    NormalizedAPIError,
    { noteId: string; graphId: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    NormalizedAPIError,
    { noteId: string; graphId: string },
    { previousNotes: Note[] | undefined }
  >({
    mutationFn: ({ noteId }) => deleteNote(noteId),
    onMutate: async ({ noteId, graphId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.list(graphId) });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData<Note[]>(
        noteKeys.list(graphId)
      );

      // Optimistically remove from cache
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          noteKeys.list(graphId),
          previousNotes.filter(note => note.id !== noteId)
        );
      }

      // Return context for rollback
      return { previousNotes };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(
          noteKeys.list(variables.graphId),
          context.previousNotes
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: noteKeys.list(variables.graphId) });
    },
    retry: false, // Don't retry deletions
    ...options,
  });
}

// ============================================================================
// Composite Hook: useNodeNotes
// ============================================================================

/**
 * Get notes filtered for a specific node
 *
 * Convenience hook that fetches all notes and filters for a specific node.
 * Includes mutation helpers with the graphId pre-configured.
 *
 * @param graphId - Graph ID
 * @param nodeId - Node ID to filter by
 * @returns Notes for the node and mutation helpers
 *
 * @example
 * ```typescript
 * const {
 *   notes,
 *   isLoading,
 *   createNote,
 *   updateNote,
 *   deleteNote,
 *   hasNotes
 * } = useNodeNotes('graph_abc123', 'node_1');
 *
 * const handleSaveNote = (content: string) => {
 *   createNote({ content, nodeId: 'node_1' });
 * };
 *
 * return (
 *   <div>
 *     {hasNotes && <NoteBadge count={notes.length} />}
 *     <NoteEditor
 *       notes={notes}
 *       onSave={handleSaveNote}
 *       isLoading={isLoading}
 *     />
 *   </div>
 * );
 * ```
 */
export function useNodeNotes(graphId: string, nodeId: string | null) {
  const hasNode = !!nodeId;

  const notesQuery = useNotes(graphId, {
    enabled: !!graphId && hasNode,
    select: (notes) => (hasNode ? notes.filter(note => note.nodeId === nodeId) : []),
  });

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  return {
    // Query state
    notes: notesQuery.data || [],
    isLoading: notesQuery.isLoading && hasNode,
    error: notesQuery.error,
    hasNotes: hasNode && (notesQuery.data?.length || 0) > 0,

    // Convenience mutation helpers (pre-configured)
    createNote: (content: string) =>
      hasNode
        ? createNoteMutation.mutate({ graphId, nodeId, content })
        : undefined,
    updateNote: (noteId: string, content: string) =>
      updateNoteMutation.mutate({ noteId, graphId, content }),
    deleteNote: (noteId: string) =>
      deleteNoteMutation.mutate({ noteId, graphId }),

    // Full mutation objects (for mutateAsync, status, etc.)
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,

    // Mutation states
    isCreating: createNoteMutation.isLoading,
    isUpdating: updateNoteMutation.isLoading,
    isDeleting: deleteNoteMutation.isLoading,
  };
}

// ============================================================================
// Composite Hook: useEdgeNotes
// ============================================================================

/**
 * Get notes filtered for a specific edge
 *
 * Convenience hook that fetches all notes and filters for a specific edge.
 * Includes mutation helpers with the graphId pre-configured.
 *
 * @param graphId - Graph ID
 * @param edgeId - Edge ID to filter by
 * @returns Notes for the edge and mutation helpers
 *
 * @example
 * ```typescript
 * const {
 *   notes,
 *   isLoading,
 *   createNote,
 *   updateNote,
 *   deleteNote,
 *   hasNotes
 * } = useEdgeNotes('graph_abc123', 'edge_1');
 *
 * const handleSaveEdgeNote = (content: string) => {
 *   createNote({ content, edgeId: 'edge_1' });
 * };
 *
 * return (
 *   <EdgeDetailsPanel edge={edge}>
 *     {hasNotes && <NotesSection notes={notes} />}
 *     <AddNoteButton onClick={() => handleSaveEdgeNote('...')} />
 *   </EdgeDetailsPanel>
 * );
 * ```
 */
export function useEdgeNotes(graphId: string, edgeId: string) {
  const notesQuery = useNotes(graphId, {
    select: (notes) => notes.filter(note => note.edgeId === edgeId),
  });

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  return {
    // Query state
    notes: notesQuery.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    hasNotes: (notesQuery.data?.length || 0) > 0,

    // Mutations with graphId/edgeId pre-configured
    createNote: (content: string) =>
      createNoteMutation.mutate({ graphId, edgeId, content }),
    updateNote: (noteId: string, content: string) =>
      updateNoteMutation.mutate({ noteId, graphId, content }),
    deleteNote: (noteId: string) =>
      deleteNoteMutation.mutate({ noteId, graphId }),

    // Mutation states
    isCreating: createNoteMutation.isLoading,
    isUpdating: updateNoteMutation.isLoading,
    isDeleting: deleteNoteMutation.isLoading,
  };
}
