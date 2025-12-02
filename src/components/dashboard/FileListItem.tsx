import type { FileItem } from '@/types';
import { cyber } from '@/styles/cyber';
import { InlineEdit } from '@/components/common';

interface FileListItemProps {
  item: FileItem;
  index: number;
  isSelected: boolean;
  isEditing: boolean;
  editingValue: string;
  onEditChange: (value: string) => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  onEditSave: () => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onStartEditing: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

export function FileListItem({
  item,
  index,
  isSelected,
  isEditing,
  editingValue,
  onEditChange,
  onEditKeyDown,
  onEditSave,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onStartEditing,
}: FileListItemProps) {
  const isFolder = item.type === 'folder';

  return (
    <tr
      draggable={!isEditing}
      onDragStart={onDragStart}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      style={{
        background: isSelected ? cyber.black : index % 2 === 0 ? cyber.gray : cyber.white,
        color: isSelected ? cyber.white : cyber.black,
        cursor: 'pointer',
      }}
    >
      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          style={{ cursor: 'pointer' }}
        />
      </td>
      <td style={{ padding: '6px 8px' }}>
        <span style={{ marginRight: 6 }}>{isFolder ? '📁' : '📄'}</span>
        {isEditing ? (
          <InlineEdit
            value={editingValue}
            onChange={onEditChange}
            onKeyDown={onEditKeyDown}
            onBlur={onEditSave}
            style={{ width: 'calc(100% - 30px)' }}
          />
        ) : (
          <span
            onClick={(e) => {
              if (isSelected) {
                e.stopPropagation();
                onStartEditing();
              }
            }}
            style={{ cursor: isSelected ? 'text' : 'pointer' }}
          >
            {item.name}
          </span>
        )}
      </td>
      <td style={{ padding: '6px 8px' }}>{isFolder ? 'Folder' : 'Entity'}</td>
      <td style={{ padding: '6px 8px' }}>
        {item.type === 'entity' ? formatRelativeTime(item.data.modifiedAt) : '—'}
      </td>
    </tr>
  );
}
