import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLibraryData, useFilteredEntities, getFolderEntityCount } from './useLibraryData';
import type { EntitySummary } from '@/api';

describe('useLibraryData', () => {
  it('fetches folders and entities', async () => {
    const { result } = renderHook(() => useLibraryData());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have data
    expect(result.current.folders.length).toBeGreaterThan(0);
    expect(result.current.entities.length).toBeGreaterThan(0);
    expect(result.current.isError).toBe(false);
  });
});

describe('useFilteredEntities', () => {
  const mockEntities: EntitySummary[] = [
    {
      id: '1',
      title: 'Alpha',
      folderId: 'folder-1',
      tags: [],
      createdAt: '2024-01-01T00:00:00Z',
      modifiedAt: '2024-01-03T00:00:00Z',
      stats: { nodeCount: 5, edgeCount: 3, pageCount: 2 },
    },
    {
      id: '2',
      title: 'Beta',
      folderId: 'folder-2',
      tags: [],
      createdAt: '2024-01-02T00:00:00Z',
      modifiedAt: '2024-01-01T00:00:00Z',
      stats: { nodeCount: 10, edgeCount: 5, pageCount: 3 },
    },
    {
      id: '3',
      title: 'Gamma',
      folderId: 'folder-1',
      tags: [],
      createdAt: '2024-01-03T00:00:00Z',
      modifiedAt: '2024-01-02T00:00:00Z',
      stats: { nodeCount: 3, edgeCount: 2, pageCount: 1 },
    },
  ];

  it('filters by folder', () => {
    const { result } = renderHook(() =>
      useFilteredEntities(mockEntities, 'folder-1', 'recent')
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.every((e) => e.folderId === 'folder-1')).toBe(true);
  });

  it('returns all entities when folderId is null', () => {
    const { result } = renderHook(() =>
      useFilteredEntities(mockEntities, null, 'recent')
    );

    expect(result.current).toHaveLength(3);
  });

  it('sorts by name', () => {
    const { result } = renderHook(() =>
      useFilteredEntities(mockEntities, null, 'name')
    );

    expect(result.current[0].title).toBe('Alpha');
    expect(result.current[1].title).toBe('Beta');
    expect(result.current[2].title).toBe('Gamma');
  });

  it('sorts by node count', () => {
    const { result } = renderHook(() =>
      useFilteredEntities(mockEntities, null, 'nodes')
    );

    expect(result.current[0].stats.nodeCount).toBe(10);
    expect(result.current[1].stats.nodeCount).toBe(5);
    expect(result.current[2].stats.nodeCount).toBe(3);
  });

  it('sorts by recent (modifiedAt)', () => {
    const { result } = renderHook(() =>
      useFilteredEntities(mockEntities, null, 'recent')
    );

    expect(result.current[0].id).toBe('1'); // Most recently modified
    expect(result.current[1].id).toBe('3');
    expect(result.current[2].id).toBe('2');
  });
});

describe('getFolderEntityCount', () => {
  const mockEntities: EntitySummary[] = [
    {
      id: '1',
      title: 'A',
      folderId: 'folder-1',
      tags: [],
      createdAt: '',
      modifiedAt: '',
      stats: { nodeCount: 0, edgeCount: 0, pageCount: 0 },
    },
    {
      id: '2',
      title: 'B',
      folderId: 'folder-1',
      tags: [],
      createdAt: '',
      modifiedAt: '',
      stats: { nodeCount: 0, edgeCount: 0, pageCount: 0 },
    },
    {
      id: '3',
      title: 'C',
      folderId: 'folder-2',
      tags: [],
      createdAt: '',
      modifiedAt: '',
      stats: { nodeCount: 0, edgeCount: 0, pageCount: 0 },
    },
  ];

  it('returns total count for null folderId', () => {
    expect(getFolderEntityCount(mockEntities, null)).toBe(3);
  });

  it('returns count for specific folder', () => {
    expect(getFolderEntityCount(mockEntities, 'folder-1')).toBe(2);
    expect(getFolderEntityCount(mockEntities, 'folder-2')).toBe(1);
  });

  it('returns 0 for non-existent folder', () => {
    expect(getFolderEntityCount(mockEntities, 'folder-999')).toBe(0);
  });
});
