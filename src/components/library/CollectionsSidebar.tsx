import type { Folder } from '@/api';
import { FolderIcon, AllItemsIcon, PlusIcon, ClockIcon, StarIcon } from '@/components/icons';

interface CollectionsSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  entityCount: number;
  getFolderCount: (folderId: string) => number;
  onCreateFolder: () => void;
}

export function CollectionsSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  entityCount,
  getFolderCount,
  onCreateFolder,
}: CollectionsSidebarProps) {
  const rootFolders = folders.filter((f) => f.parentId === null);

  return (
    <div className="paper-card paper-stack p-4 sticky top-24">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-200">
        <h3 className="text-xs font-semibold text-sand-600 uppercase tracking-widest">Collections</h3>
        <button
          onClick={onCreateFolder}
          className="text-sand-400 hover:text-terra-500 transition-colors"
          title="New Folder"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {/* All Entities */}
        <FolderButton
          icon={<AllItemsIcon />}
          label="All Entities"
          count={entityCount}
          isSelected={selectedFolderId === null}
          onClick={() => { onSelectFolder(null); }}
          bold
        />

        {/* Root Folders */}
        {rootFolders.map((folder) => (
          <FolderGroup
            key={folder.id}
            folder={folder}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            getFolderCount={getFolderCount}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="divider-torn my-5" />

      {/* Quick Access */}
      <div>
        <h4 className="text-xs font-semibold text-sand-600 uppercase tracking-widest mb-3">Quick Access</h4>
        <div className="space-y-1">
          <QuickAccessButton icon={<ClockIcon />} label="Recent" />
          <QuickAccessButton icon={<StarIcon />} label="Starred" />
        </div>
      </div>
    </div>
  );
}

interface FolderButtonProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
  bold?: boolean;
  indent?: boolean;
}

function FolderButton({ icon, label, count, isSelected, onClick, bold, indent }: FolderButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`folder-item w-full ${isSelected ? 'active' : ''} ${indent ? 'pl-9' : ''}`}
    >
      <span className={`folder-icon ${isSelected ? 'text-terra-500' : 'text-sand-400'} ${indent ? 'w-3.5 h-3.5' : ''}`}>
        {icon}
      </span>
      <span className={bold ? 'font-medium' : ''}>{label}</span>
      <span className={`ml-auto text-xs text-sand-600 ${isSelected && !indent ? 'bg-sand-200/50 px-1.5 py-0.5 rounded' : ''}`}>
        {count}
      </span>
    </button>
  );
}

interface FolderGroupProps {
  folder: Folder;
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  getFolderCount: (folderId: string) => number;
}

function FolderGroup({ folder, folders, selectedFolderId, onSelectFolder, getFolderCount }: FolderGroupProps) {
  const childFolders = folders.filter((f) => f.parentId === folder.id);

  return (
    <div>
      <FolderButton
        icon={<FolderIcon />}
        label={folder.name}
        count={getFolderCount(folder.id)}
        isSelected={selectedFolderId === folder.id}
        onClick={() => { onSelectFolder(folder.id); }}
      />
      {childFolders.map((child) => (
        <FolderButton
          key={child.id}
          icon={<FolderIcon className="w-3.5 h-3.5" />}
          label={child.name}
          count={getFolderCount(child.id)}
          isSelected={selectedFolderId === child.id}
          onClick={() => { onSelectFolder(child.id); }}
          indent
        />
      ))}
    </div>
  );
}

function QuickAccessButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full text-left text-sm text-sand-600 hover:text-terra-600 flex items-center gap-2.5 py-2 px-2 rounded hover:bg-sand-100 transition-colors">
      {icon}
      {label}
    </button>
  );
}
