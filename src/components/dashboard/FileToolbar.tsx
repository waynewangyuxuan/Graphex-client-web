import { cyber } from '@/styles/cyber';
import { Button, Select } from '@/components/cyber';

type ViewMode = 'list' | 'icon';
type SortField = 'name' | 'modifiedAt' | 'createdAt' | 'type';
type SortOrder = 'asc' | 'desc';

interface FileToolbarProps {
  hasSelection: boolean;
  showAllItems: boolean;
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  onOpen: () => void;
  onMove: () => void;
  onDelete: () => void;
  onCreateEntity: () => void;
  onToggleShowAll: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderToggle: () => void;
}

export function FileToolbar({
  hasSelection,
  showAllItems,
  viewMode,
  sortField,
  sortOrder,
  onOpen,
  onMove,
  onDelete,
  onCreateEntity,
  onToggleShowAll,
  onViewModeChange,
  onSortFieldChange,
  onSortOrderToggle,
}: FileToolbarProps) {
  return (
    <div
      style={{
        padding: '4px 8px',
        borderBottom: `1px solid ${cyber.gray}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: cyber.white,
      }}
    >
      <Button
        onClick={onOpen}
        disabled={!hasSelection}
        style={{ fontSize: 10, padding: '2px 8px' }}
      >
        Open
      </Button>
      <Button
        onClick={onMove}
        disabled={!hasSelection}
        style={{ fontSize: 10, padding: '2px 8px' }}
      >
        Move to...
      </Button>
      <Button
        onClick={onDelete}
        disabled={!hasSelection}
        style={{ fontSize: 10, padding: '2px 8px' }}
      >
        Delete
      </Button>

      <div style={{ width: 1, height: 16, background: cyber.gray }} />

      <Button onClick={onCreateEntity} style={{ fontSize: 10, padding: '2px 8px' }}>
        + New
      </Button>

      <div style={{ width: 1, height: 16, background: cyber.gray }} />

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <input
          type="checkbox"
          checked={showAllItems}
          onChange={onToggleShowAll}
          style={{ cursor: 'pointer' }}
        />
        Show All
      </label>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 2 }}>
        <Button
          onClick={() => onViewModeChange('list')}
          active={viewMode === 'list'}
          style={{ fontSize: 10, padding: '2px 6px' }}
          title="List View"
        >
          ☰
        </Button>
        <Button
          onClick={() => onViewModeChange('icon')}
          active={viewMode === 'icon'}
          style={{ fontSize: 10, padding: '2px 6px' }}
          title="Icon View"
        >
          ⊞
        </Button>
      </div>

      <div style={{ width: 1, height: 16, background: cyber.gray }} />

      <Select
        value={sortField}
        onChange={(value: string) => onSortFieldChange(value as SortField)}
        options={[
          { value: 'name', label: 'Name' },
          { value: 'type', label: 'Type' },
          { value: 'modifiedAt', label: 'Date Modified' },
          { value: 'createdAt', label: 'Date Added' },
        ]}
      />
      <Button
        onClick={onSortOrderToggle}
        style={{ fontSize: 10, padding: '2px 6px' }}
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </Button>
    </div>
  );
}
