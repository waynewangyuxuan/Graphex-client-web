# Refactoring Plan: Separation of Concerns

## Current Problem
- Large components like `EntityList.tsx` (~500 lines) mix:
  - State management logic
  - Event handlers
  - Inline JSX/HTML rendering
- Hard to maintain and reuse

## Proposed Architecture

### 1. Folder Structure
```
src/
├── components/
│   ├── retro/          # Existing - primitive UI components (Button, Modal, etc.)
│   ├── dashboard/      # Feature components
│   │   ├── FileListItem.tsx       # List view row
│   │   ├── FileGridItem.tsx       # Icon view item
│   │   ├── FileListHeader.tsx     # Table header
│   │   ├── FileToolbar.tsx        # Toolbar with actions
│   │   ├── FolderTree.tsx         # Keep as-is (already focused)
│   │   ├── EntityList.tsx         # Container - uses above components
│   │   └── index.ts
│   └── common/         # Shared presentational components
│       ├── InlineEdit.tsx         # Reusable inline edit input
│       └── index.ts
├── hooks/
│   ├── useFileList.ts             # State & handlers for file list
│   ├── useInlineEdit.ts           # Inline editing logic
│   ├── useContextMenu.ts          # Context menu state
│   └── index.ts
├── pages/
│   └── Dashboard.tsx              # Page container
├── styles/
│   └── retro.ts                   # Existing - centralized styles
└── types/
    └── index.ts                   # Existing - type definitions
```

### 2. Separation Pattern

**Custom Hooks** - Extract logic:
- `useFileList`: Selection, sorting, filtering state
- `useInlineEdit`: Editing state, handlers (startEditing, saveEditing, cancelEditing)
- `useContextMenu`: Context menu position, open/close

**Presentational Components** - Pure UI, receive props:
- `FileListItem`: Single row in list view
- `FileGridItem`: Single item in icon view
- `FileToolbar`: Action buttons (Open, Move, Delete, New, etc.)
- `InlineEdit`: Reusable inline text editing input

**Container Components** - Wire hooks + presentational:
- `EntityList`: Uses hooks, passes data to presentational components

### 3. Example Refactored Structure

```tsx
// hooks/useInlineEdit.ts
export function useInlineEdit(onRenameFolder, onRenameEntity) {
  const [editingItem, setEditingItem] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const startEditing = (item) => {...};
  const saveEditing = () => {...};
  const cancelEditing = () => {...};

  return { editingItem, editingValue, setEditingValue, startEditing, saveEditing, cancelEditing };
}

// components/common/InlineEdit.tsx
export function InlineEdit({ value, onChange, onSave, onCancel }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' ? onSave() : e.key === 'Escape' && onCancel()}
      onBlur={onSave}
      autoFocus
      style={{...}}
    />
  );
}

// components/dashboard/FileListItem.tsx
export function FileListItem({ item, isSelected, isEditing, editValue, onSelect, onDoubleClick, onContextMenu, onDragStart, onEditChange, onEditSave, onEditCancel }) {
  return (
    <tr ...>
      <td><input type="checkbox" checked={isSelected} /></td>
      <td>
        <span>{item.type === 'folder' ? '📁' : '📄'}</span>
        {isEditing ? (
          <InlineEdit value={editValue} onChange={onEditChange} onSave={onEditSave} onCancel={onEditCancel} />
        ) : (
          <span onClick={...}>{item.name}</span>
        )}
      </td>
      ...
    </tr>
  );
}

// components/dashboard/EntityList.tsx (container)
export function EntityList(props) {
  const { editingItem, ... } = useInlineEdit(props.onRenameFolder, props.onRenameEntity);
  const { contextMenu, ... } = useContextMenu();

  return (
    <div>
      <FileToolbar ... />
      <Inset>
        {viewMode === 'list' ? (
          <table>
            <FileListHeader />
            <tbody>
              {items.map(item => (
                <FileListItem key={item.id} item={item} isEditing={editingItem?.id === item.id} ... />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="icon-grid">
            {items.map(item => <FileGridItem key={item.id} ... />)}
          </div>
        )}
      </Inset>
    </div>
  );
}
```

## Implementation Order
1. Create `hooks/` folder with `useInlineEdit.ts`
2. Create `components/common/InlineEdit.tsx`
3. Create `FileListItem.tsx` and `FileGridItem.tsx`
4. Create `FileToolbar.tsx`
5. Refactor `EntityList.tsx` to use new components
6. Extract more hooks (`useContextMenu`, `useFileList`) as needed

## Benefits
- Reusable components across the app
- Testable hooks in isolation
- Cleaner, more maintainable code
- Clear separation: logic (hooks) vs presentation (components)
