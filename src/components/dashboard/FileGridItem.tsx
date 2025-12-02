import type { FileItem } from '@/types';
import { cyber } from '@/styles/cyber';
import { InlineEdit } from '@/components/common';

interface FileGridItemProps {
  item: FileItem;
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

export function FileGridItem({
  item,
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
}: FileGridItemProps) {
  const isFolder = item.type === 'folder';

  return (
    <div
      draggable={!isEditing}
      onDragStart={onDragStart}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      style={{
        padding: 8,
        textAlign: 'center',
        background: isSelected ? cyber.blue : 'transparent',
        color: isSelected ? cyber.white : cyber.black,
        cursor: 'pointer',
        border: '1px solid transparent',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 4 }}>{isFolder ? '📁' : '📄'}</div>
      {isEditing ? (
        <InlineEdit
          value={editingValue}
          onChange={onEditChange}
          onKeyDown={onEditKeyDown}
          onBlur={onEditSave}
          fontSize={11}
          textAlign="center"
          style={{ width: '100%' }}
        />
      ) : (
        <div
          onClick={(e) => {
            if (isSelected) {
              e.stopPropagation();
              onStartEditing();
            }
          }}
          style={{
            fontSize: 11,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: isSelected ? 'text' : 'pointer',
          }}
        >
          {item.name}
        </div>
      )}
    </div>
  );
}
