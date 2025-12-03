import { useNavigate } from 'react-router-dom';
import type { EntitySummary } from '@/api';
import { DocumentIcon, MoreIcon, SearchIcon } from '@/components/icons';
import { Dropdown } from '@/components/ui';

type SortOption = 'recent' | 'name' | 'nodes';

interface EntityTableProps {
  entities: EntitySummary[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function EntityTable({
  entities,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: EntityTableProps) {
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

      {/* Table */}
      <div className="paper-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 bg-gradient-to-b from-sand-100 to-sand-50 border-b border-sand-200 text-xs font-semibold text-sand-500 uppercase tracking-wider">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Nodes</div>
          <div className="col-span-3">Modified</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        {entities.length === 0 ? (
          <EmptyState />
        ) : (
          entities.map((entity) => <EntityRow key={entity.id} entity={entity} />)
        )}
      </div>

      {/* Pagination */}
      {entities.length > 0 && (
        <div className="flex items-center justify-between mt-5 text-sm text-sand-500">
          <span>Showing {entities.length} entities</span>
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

function EntityRow({ entity }: { entity: EntitySummary }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => { navigate(`/entity/${entity.id}`); }}
      className="entity-row grid-cols-12"
    >
      <div className="col-span-6 flex items-center gap-3">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-1.5 text-sand-400 hover:text-sand-600 rounded transition-colors"
        >
          <MoreIcon />
        </button>
      </div>
    </div>
  );
}
