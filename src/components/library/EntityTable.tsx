import { useNavigate } from 'react-router-dom';
import type { EntitySummary } from '@/api';
import { DocumentIcon, MoreIcon, SearchIcon, PencilIcon, TrashIcon, MoveIcon } from '@/components/icons';
import { Dropdown, ContextMenu, type MenuItem } from '@/components/ui';

type SortOption = 'recent' | 'name' | 'nodes';

const PAGE_SIZE = 10;

interface EntityTableProps {
  entities: EntitySummary[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function EntityTable({
  entities,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  selectedIds,
  onSelectionChange,
  currentPage,
  onPageChange,
}: EntityTableProps) {
  const totalPages = Math.ceil(entities.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedEntities = entities.slice(startIndex, startIndex + PAGE_SIZE);

  const allSelected = paginatedEntities.length > 0 && paginatedEntities.every((e) => selectedIds.has(e.id));
  const someSelected = paginatedEntities.some((e) => selectedIds.has(e.id));

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all on current page
      const next = new Set(selectedIds);
      paginatedEntities.forEach((e) => { next.delete(e.id); });
      onSelectionChange(next);
    } else {
      // Select all on current page
      const next = new Set(selectedIds);
      paginatedEntities.forEach((e) => { next.add(e.id); });
      onSelectionChange(next);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    onSelectionChange(next);
  };
  return (
    <>
      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 text-sand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entities..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => { onSearchChange(e.target.value); }}
          />
        </div>
        <Dropdown
          value={sortBy}
          onChange={onSortChange}
          options={[
            { value: 'recent', label: 'Sort: Recent' },
            { value: 'name', label: 'Sort: Name' },
            { value: 'nodes', label: 'Sort: Nodes' },
          ]}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 mb-4 rounded-lg bg-terra-50 border border-terra-200">
          <span className="text-sm font-medium text-terra-700">
            {selectedIds.size} {selectedIds.size === 1 ? 'entity' : 'entities'} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { console.log('Move selected:', [...selectedIds]); }}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Move to Folder
            </button>
            <button
              onClick={() => { console.log('Delete selected:', [...selectedIds]); }}
              className="btn-secondary text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              Delete
            </button>
            <button
              onClick={() => { onSelectionChange(new Set()); }}
              className="text-xs text-sand-500 hover:text-sand-700 px-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="paper-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 bg-gradient-to-b from-sand-100 to-sand-50 border-b border-sand-200 text-xs font-semibold text-sand-500 uppercase tracking-wider items-center">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
              onChange={handleSelectAll}
              className="checkbox"
            />
          </div>
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Nodes</div>
          <div className="col-span-3">Modified</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        {paginatedEntities.length === 0 ? (
          <EmptyState />
        ) : (
          paginatedEntities.map((entity) => (
            <EntityRow
              key={entity.id}
              entity={entity}
              isSelected={selectedIds.has(entity.id)}
              onSelect={(checked) => { handleSelectOne(entity.id, checked); }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {entities.length > 0 && (
        <div className="flex items-center justify-between mt-5 text-sm text-sand-500">
          <span>
            Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, entities.length)} of {entities.length} entities
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onPageChange(currentPage - 1); }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded border border-sand-200 hover:bg-sand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => { onPageChange(page); }}
                  className={`w-8 h-8 rounded transition-colors ${
                    page === currentPage
                      ? 'bg-terra-500 text-white'
                      : 'border border-sand-200 hover:bg-sand-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => { onPageChange(currentPage + 1); }}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded border border-sand-200 hover:bg-sand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-12 text-center text-sand-400">
      <DocumentIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No entities yet. Click "New Entity" to create one.</p>
    </div>
  );
}

const avatarColors = [
  'from-terra-400 to-terra-600',
  'from-amber-400 to-amber-600',
  'from-teal-400 to-teal-600',
  'from-emerald-400 to-emerald-600',
  'from-rose-400 to-rose-600',
  'from-violet-400 to-violet-600',
];

function getAvatarColor(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function getInitials(title: string): string {
  return title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

interface EntityRowProps {
  entity: EntitySummary;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

function EntityRow({ entity, isSelected, onSelect }: EntityRowProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => { navigate(`/entity/${entity.id}`); }}
      className={`entity-row grid-cols-12 ${isSelected ? 'bg-terra-50' : ''}`}
    >
      <div className="col-span-1 flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => { onSelect(e.target.checked); }}
          onClick={(e) => { e.stopPropagation(); }}
          className="checkbox"
        />
      </div>
      <div className="col-span-5 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAvatarColor(entity.id)} flex items-center justify-center text-white text-sm font-semibold shadow-sm`}
        >
          {getInitials(entity.title)}
        </div>
        <div>
          <div className="font-medium text-sand-800">{entity.title}</div>
          {entity.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {entity.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="col-span-2 text-sm text-sand-600">
        <span className="font-semibold text-sand-800">{entity.stats.nodeCount}</span> nodes
      </div>
      <div className="col-span-3 text-sm text-sand-500">{formatRelativeTime(entity.modifiedAt)}</div>
      <div className="col-span-1 flex justify-end">
        <ContextMenu
          trigger={<MoreIcon />}
          items={getEntityMenuItems(entity.id, entity.title)}
        />
      </div>
    </div>
  );
}

function getEntityMenuItems(entityId: string, entityTitle: string): MenuItem[] {
  return [
    {
      label: 'Rename',
      icon: <PencilIcon />,
      onClick: () => { console.log('Rename entity:', entityId, entityTitle); },
    },
    {
      label: 'Move to Folder',
      icon: <MoveIcon />,
      onClick: () => { console.log('Move entity:', entityId); },
    },
    {
      label: 'Delete',
      icon: <TrashIcon />,
      onClick: () => { console.log('Delete entity:', entityId); },
      danger: true,
    },
  ];
}
