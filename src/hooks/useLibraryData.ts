import { useMemo } from 'react';
import { useAsync } from './useAsync';
import { fetchFolders, fetchEntities } from '@/api';
import type { EntitySummary } from '@/api';

/**
 * Hook for fetching and managing library data (folders + entities).
 */
export function useLibraryData() {
  const foldersQuery = useAsync(fetchFolders, []);
  const entitiesQuery = useAsync(fetchEntities, []);

  const isLoading = foldersQuery.status === 'loading' || entitiesQuery.status === 'loading';
  const isError = foldersQuery.status === 'error' || entitiesQuery.status === 'error';
  const error = foldersQuery.error ?? entitiesQuery.error;

  const folders = foldersQuery.data ?? [];
  const entities = entitiesQuery.data ?? [];

  return {
    folders,
    entities,
    isLoading,
    isError,
    error,
    refetch: () => {
      foldersQuery.refetch();
      entitiesQuery.refetch();
    },
  };
}

/**
 * Hook for filtering and sorting entities.
 */
export function useFilteredEntities(
  entities: EntitySummary[],
  selectedFolderId: string | null,
  sortBy: 'recent' | 'name' | 'nodes',
  searchQuery: string = ''
) {
  return useMemo(() => {
    let filtered = entities;

    // Filter by folder
    if (selectedFolderId !== null) {
      filtered = filtered.filter((e) => e.folderId === selectedFolderId);
    }

    // Filter by search query (title or tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'nodes':
        sorted.sort((a, b) => b.stats.nodeCount - a.stats.nodeCount);
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
        break;
    }

    return sorted;
  }, [entities, selectedFolderId, sortBy, searchQuery]);
}

/**
 * Get entity count for a folder.
 */
export function getFolderEntityCount(entities: EntitySummary[], folderId: string | null): number {
  if (folderId === null) return entities.length;
  return entities.filter((e) => e.folderId === folderId).length;
}
