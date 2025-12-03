import { useState } from 'react';
import { useLibraryData, useFilteredEntities, getFolderEntityCount } from '@/hooks';
import { PlusIcon } from '@/components/icons';
import { StatsRow, CollectionsSidebar, EntityTable, CreateEntityModal, CreateFolderModal } from '@/components/library';

type SortOption = 'recent' | 'name' | 'nodes';

export default function Dashboard() {
  const { folders, entities, isLoading, isError, error } = useLibraryData();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEntities = useFilteredEntities(entities, selectedFolderId, sortBy, searchQuery);

  // Reset to page 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFolderChange = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };
  const totalNodes = entities.reduce((sum, e) => sum + e.stats.nodeCount, 0);

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-sand-800 mb-2">Failed to load data</h2>
          <p className="text-sand-500">{error?.message ?? 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-sand-900 mb-1">Knowledge Library</h1>
          <p className="text-sand-500 text-sm">Organize and explore your knowledge entities</p>
        </div>
        <button onClick={() => { setShowCreateModal(true); }} className="btn-primary">
          <PlusIcon className="w-4 h-4" />
          New Entity
        </button>
      </div>

      {/* Stats Row */}
      <StatsRow
        entityCount={entities.length}
        totalNodes={totalNodes}
        exploredPercent={68}
        dayStreak={7}
      />

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-sand-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <CollectionsSidebar
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleFolderChange}
              entityCount={entities.length}
              getFolderCount={(folderId) => getFolderEntityCount(entities, folderId)}
              onCreateFolder={() => { setShowFolderModal(true); }}
            />
          </div>

          {/* Entity List */}
          <div className="col-span-9">
            <EntityTable
                entities={filteredEntities}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
          </div>
        </div>
      )}

      <CreateEntityModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); }}
        onSubmit={(data) => {
          // TODO: Call API to create entity, then refetch
          console.log('Create entity:', data);
        }}
        folders={folders}
      />

      <CreateFolderModal
        isOpen={showFolderModal}
        onClose={() => { setShowFolderModal(false); }}
        onSubmit={(data) => {
          // TODO: Call API to create folder, then refetch
          console.log('Create folder:', data);
        }}
      />
    </main>
  );
}
