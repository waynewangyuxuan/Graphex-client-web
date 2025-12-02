import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Folder, EntitySummary } from '@/types';
import { Header } from '@/components/layout';

// Icons
const FolderIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const AllItemsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const DocumentIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LinkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const MoreIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

// Avatar colors for entities
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [entities, setEntities] = useState<EntitySummary[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/folders')
      .then((res) => res.json())
      .then(setFolders);

    fetch('/api/entities')
      .then((res) => res.json())
      .then(setEntities);
  }, []);

  // Get folder counts
  const getFolderEntityCount = (folderId: string | null): number => {
    if (folderId === null) return entities.length;
    return entities.filter((e) => e.folderId === folderId).length;
  };

  // Filter entities by selected folder
  const filteredEntities = useMemo(() => {
    if (selectedFolderId === null) return entities;
    return entities.filter((e) => e.folderId === selectedFolderId);
  }, [entities, selectedFolderId]);

  // Stats
  const totalNodes = entities.reduce((sum, e) => sum + e.stats.nodeCount, 0);

  return (
    <div className="min-h-screen flex flex-col paper-bg">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Page Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-sand-900 mb-1">
              Knowledge Library
            </h1>
            <p className="text-sand-500 text-sm">
              Organize and explore your knowledge entities
            </p>
          </div>
          <button className="btn-primary">
            <PlusIcon className="w-4 h-4" />
            New Entity
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="paper-card p-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[1.75rem] font-semibold text-sand-900 leading-none">
                  {entities.length}
                </div>
                <div className="text-[0.7rem] text-sand-600 uppercase tracking-widest mt-1.5">
                  Entities
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-terra-500/10 flex items-center justify-center">
                <DocumentIcon className="w-5 h-5 text-terra-500" />
              </div>
            </div>
          </div>

          <div className="paper-card p-5 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[1.75rem] font-semibold text-sand-900 leading-none">
                  {totalNodes}
                </div>
                <div className="text-[0.7rem] text-sand-600 uppercase tracking-widest mt-1.5">
                  Total Nodes
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-accent-500" />
              </div>
            </div>
          </div>

          <div className="paper-card p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[1.75rem] font-semibold text-sand-900 leading-none">
                  68%
                </div>
                <div className="text-[0.7rem] text-sand-600 uppercase tracking-widest mt-1.5">
                  Explored
                </div>
              </div>
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#E6D9C6" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#C96442"
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset="30"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="paper-card p-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[1.75rem] font-semibold text-sand-900 leading-none flex items-center gap-1">
                  7
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="text-[0.7rem] text-sand-600 uppercase tracking-widest mt-1.5">
                  Day Streak
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar: Collections */}
          <div className="col-span-3">
            <div className="paper-card paper-stack p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-200">
                <h3 className="text-xs font-semibold text-sand-600 uppercase tracking-widest">
                  Collections
                </h3>
                <button className="text-sand-400 hover:text-terra-500 transition-colors" title="New Folder">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {/* All Entities */}
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={`folder-item w-full ${selectedFolderId === null ? 'active' : ''}`}
                >
                  <AllItemsIcon className={`folder-icon ${selectedFolderId === null ? 'text-terra-500' : 'text-sand-400'}`} />
                  <span className="font-medium">All Entities</span>
                  <span className="ml-auto text-xs text-sand-400 bg-sand-200/50 px-1.5 py-0.5 rounded">
                    {entities.length}
                  </span>
                </button>

                {/* Folders */}
                {folders.filter((f) => f.parentId === null).map((folder) => (
                  <div key={folder.id}>
                    <button
                      onClick={() => setSelectedFolderId(folder.id)}
                      className={`folder-item w-full ${selectedFolderId === folder.id ? 'active' : ''}`}
                    >
                      <FolderIcon className={`folder-icon ${selectedFolderId === folder.id ? 'text-terra-500' : 'text-sand-400'}`} />
                      <span>{folder.name}</span>
                      <span className="ml-auto text-xs text-sand-400">
                        {getFolderEntityCount(folder.id)}
                      </span>
                    </button>
                    {/* Child folders */}
                    {folders
                      .filter((f) => f.parentId === folder.id)
                      .map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedFolderId(child.id)}
                          className={`folder-item w-full pl-9 ${selectedFolderId === child.id ? 'active' : ''}`}
                        >
                          <FolderIcon className={`w-3.5 h-3.5 folder-icon ${selectedFolderId === child.id ? 'text-terra-500' : 'text-sand-400'}`} />
                          <span>{child.name}</span>
                          <span className="ml-auto text-xs text-sand-400">
                            {getFolderEntityCount(child.id)}
                          </span>
                        </button>
                      ))}
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="divider-torn my-5" />

              {/* Quick Access */}
              <div>
                <h4 className="text-xs font-semibold text-sand-400 uppercase tracking-widest mb-3">
                  Quick Access
                </h4>
                <div className="space-y-1">
                  <button className="w-full text-left text-sm text-sand-600 hover:text-terra-600 flex items-center gap-2.5 py-2 px-2 rounded hover:bg-sand-100 transition-colors">
                    <ClockIcon />
                    Recent
                  </button>
                  <button className="w-full text-left text-sm text-sand-600 hover:text-terra-600 flex items-center gap-2.5 py-2 px-2 rounded hover:bg-sand-100 transition-colors">
                    <StarIcon />
                    Starred
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main: Entity List */}
          <div className="col-span-9">
            {/* Search & Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <svg
                  className="w-4 h-4 text-sand-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search entities..."
                  className="input pl-10"
                />
              </div>
              <select className="btn-secondary text-sm rounded-lg px-3 py-2.5 cursor-pointer">
                <option>Sort: Recent</option>
                <option>Sort: Name</option>
                <option>Sort: Nodes</option>
              </select>
            </div>

            {/* Entity Table */}
            <div className="paper-card overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 px-5 py-3 bg-gradient-to-b from-sand-100 to-sand-50 border-b border-sand-200 text-xs font-semibold text-sand-500 uppercase tracking-wider">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Nodes</div>
                <div className="col-span-3">Modified</div>
                <div className="col-span-1" />
              </div>

              {/* Rows */}
              {filteredEntities.length === 0 ? (
                <div className="px-5 py-12 text-center text-sand-400">
                  <DocumentIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No entities yet. Click "New Entity" to create one.</p>
                </div>
              ) : (
                filteredEntities.map((entity) => (
                  <div
                    key={entity.id}
                    onClick={() => navigate(`/entity/${entity.id}`)}
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
                    <div className="col-span-3 text-sm text-sand-500">
                      {formatRelativeTime(entity.modifiedAt)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Context menu would go here
                        }}
                        className="p-1.5 text-sand-400 hover:text-sand-600 rounded transition-colors"
                      >
                        <MoreIcon />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {filteredEntities.length > 0 && (
              <div className="flex items-center justify-between mt-5 text-sm text-sand-500">
                <span>Showing {filteredEntities.length} entities</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sand-400 text-sm">
          <p>Graphex — Transform documents into knowledge</p>
        </div>
      </footer>
    </div>
  );
}
