/**
 * Notes API Functions
 *
 * API functions for note CRUD operations on nodes, edges, and graphs.
 */

import apiClient from '@/lib/api-client';
import type {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
} from '@/types/api.types';

// ============================================================================
// Create Note
// ============================================================================

/**
 * Create a new note attached to a graph, node, or edge
 *
 * @param request - Note creation request with content and optional node/edge IDs
 * @returns Created note object
 *
 * @example
 * ```typescript
 * // Create note for a node
 * const note = await createNote({
 *   graphId: 'graph_abc123',
 *   nodeId: 'node_1',
 *   content: 'This concept is fundamental'
 * });
 *
 * // Create note for an edge
 * const edgeNote = await createNote({
 *   graphId: 'graph_abc123',
 *   edgeId: 'edge_1',
 *   content: 'This connection represents causation'
 * });
 *
 * // Create general graph note
 * const graphNote = await createNote({
 *   graphId: 'graph_abc123',
 *   content: 'Overall document summary'
 * });
 * ```
 */
export async function createNote(
  request: NoteCreateRequest
): Promise<Note> {
  return apiClient.post<NoteCreateRequest, Note>('/notes', request);
}

// ============================================================================
// Get Notes
// ============================================================================

/**
 * Get all notes for a graph
 *
 * Returns all notes attached to the graph, its nodes, and its edges.
 * Filter by nodeId or edgeId client-side if needed.
 *
 * @param graphId - Graph ID
 * @returns Array of notes
 *
 * @example
 * ```typescript
 * // Get all notes for a graph
 * const notes = await getNotes('graph_abc123');
 *
 * // Filter for specific node
 * const nodeNotes = notes.filter(note => note.nodeId === 'node_1');
 *
 * // Filter for edges only
 * const edgeNotes = notes.filter(note => note.edgeId !== null);
 * ```
 */
export async function getNotes(graphId: string): Promise<Note[]> {
  return apiClient.get<never, Note[]>(`/notes?graphId=${graphId}`);
}

// ============================================================================
// Update Note
// ============================================================================

/**
 * Update note content
 *
 * @param noteId - Note ID
 * @param request - Note update request with new content
 * @returns Updated note object
 *
 * @example
 * ```typescript
 * const updated = await updateNote('note_abc123', {
 *   content: 'Updated note content with more details'
 * });
 * console.log(updated.updatedAt); // New timestamp
 * ```
 */
export async function updateNote(
  noteId: string,
  request: NoteUpdateRequest
): Promise<Note> {
  return apiClient.put<NoteUpdateRequest, Note>(`/notes/${noteId}`, request);
}

// ============================================================================
// Delete Note
// ============================================================================

/**
 * Delete a note
 *
 * @param noteId - Note ID
 * @returns void (204 No Content)
 *
 * @example
 * ```typescript
 * await deleteNote('note_abc123');
 * // Note is permanently deleted
 * ```
 */
export async function deleteNote(noteId: string): Promise<void> {
  return apiClient.delete<never, void>(`/notes/${noteId}`);
}
