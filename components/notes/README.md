# Notes Components

Feature 3: Node Notes modal with save/edit/delete functionality.

## Components

### NoteModal

Main modal component for creating and editing notes on graph nodes.

**Features:**
- Auto-save with 2-second debounce
- Save status indicator (Saving... → Saved ✓)
- Character counter (max 2000 characters)
- Delete confirmation
- Auto-focus on textarea
- Accessible with proper ARIA labels

**Usage:**

```tsx
import { NoteModal } from '@/components/notes';

function GraphView() {
  const [noteModalState, setNoteModalState] = useState({
    isOpen: false,
    nodeId: null as string | null,
    nodeTitle: null as string | null,
  });

  return (
    <>
      {/* Your graph component */}
      <GraphContainer
        onNodeRightClick={(nodeId, nodeTitle) =>
          setNoteModalState({ isOpen: true, nodeId, nodeTitle })
        }
      />

      {/* Note modal */}
      <NoteModal
        isOpen={noteModalState.isOpen}
        onClose={() => setNoteModalState({ isOpen: false, nodeId: null, nodeTitle: null })}
        graphId={graphId}
        nodeId={noteModalState.nodeId || undefined}
        nodeTitle={noteModalState.nodeTitle || undefined}
      />
    </>
  );
}
```

### NoteContent

Textarea component with auto-resize and character counter.

**Usage:**

```tsx
import { NoteContent } from '@/components/notes';

function MyForm() {
  const [content, setContent] = useState('');

  return (
    <NoteContent
      value={content}
      onChange={setContent}
      maxLength={2000}
      placeholder="Write your notes..."
      autoFocus
    />
  );
}
```

### SaveStatus

Auto-save status indicator with smooth transitions.

**Usage:**

```tsx
import { SaveStatus } from '@/components/notes';

function Editor() {
  const { isSaving, lastSaved } = useAutoSave(content, {
    onSave: handleSave,
  });

  return (
    <div>
      <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />
      {/* Editor content */}
    </div>
  );
}
```

## Hooks

### useAutoSave

Custom hook for debounced auto-save functionality.

**Usage:**

```tsx
import { useAutoSave } from '@/hooks/useAutoSave';

function NoteEditor() {
  const [content, setContent] = useState('');

  const { isSaving, lastSaved, saveNow } = useAutoSave(content, {
    onSave: (content) => {
      // Save to API
      updateNote(noteId, content);
    },
    delay: 2000, // 2 second debounce
    enabled: true,
    minLength: 1,
  });

  return (
    <div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />
      <Button onClick={saveNow}>Save Now</Button>
    </div>
  );
}
```

### useNodeNotes

Convenience hook that combines note fetching and mutations for a specific node.

**Usage:**

```tsx
import { useNodeNotes } from '@/hooks/useNotes';

function NodeDetailsPanel({ graphId, nodeId }) {
  const {
    notes,
    isLoading,
    hasNotes,
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting,
  } = useNodeNotes(graphId, nodeId);

  if (isLoading) return <Spinner />;

  return (
    <div>
      {hasNotes ? (
        <div>
          <p>{notes[0].content}</p>
          <Button onClick={() => updateNote(notes[0].id, 'Updated content')}>
            Update
          </Button>
          <Button onClick={() => deleteNote(notes[0].id)}>
            Delete
          </Button>
        </div>
      ) : (
        <Button onClick={() => createNote('New note')}>
          Add Note
        </Button>
      )}
    </div>
  );
}
```

## Design Specifications

### Colors (from UIUX.md)

- Modal background: `bg-chrome` (white)
- Overlay: `bg-black/40 backdrop-blur-sm`
- Save indicator (gold): `#FFC107`
- Primary actions: `bg-primary`
- Error state: `text-error`
- Success state: `text-success`

### Typography

- Modal title: `text-xl font-semibold`
- Note content: `font-sans text-base` (15px, 1.5 line height)
- Helper text: `text-sm text-text-muted`
- Character counter: `text-xs`

### Animations

- Slide in from right: 400ms ease-out
- Blur background: `backdrop-blur-sm`
- Save indicator fade: 2 seconds
- All transitions: `duration-300`

### Accessibility

- Dialog announced to screen readers
- Focus trap within modal
- ESC key closes modal
- Textarea has `aria-label="Note content"`
- Save status has `aria-live="polite"`
- Delete requires confirmation
- All interactive elements keyboard accessible

## API Integration

The components use React Query hooks from `@/hooks/useNotes.ts`:

- `useNotes(graphId)` - Fetch all notes for a graph
- `useCreateNote()` - Create new note mutation
- `useUpdateNote()` - Update note mutation
- `useDeleteNote()` - Delete note mutation
- `useNodeNotes(graphId, nodeId)` - Combined hook for node-specific notes

All mutations include:
- Optimistic updates (instant UI feedback)
- Automatic rollback on error
- Cache invalidation on success
- No retry (fail fast)

## File Structure

```
components/notes/
├── NoteModal.tsx          # Main modal component
├── NoteContent.tsx        # Textarea with counter
├── SaveStatus.tsx         # Auto-save indicator
├── index.ts               # Exports
└── README.md              # This file

hooks/
└── useAutoSave.ts         # Auto-save hook

__tests__/
├── hooks/
│   └── useAutoSave.test.ts
└── components/notes/
    ├── SaveStatus.test.tsx
    ├── NoteContent.test.tsx
    └── NoteModal.test.tsx
```

## Testing

Run tests:

```bash
npm test -- notes
```

Tests include:
- Unit tests for useAutoSave hook (debouncing, cancellation, state tracking)
- Component tests for SaveStatus (states, transitions, accessibility)
- Component tests for NoteContent (typing, counter, validation)
- Integration tests for NoteModal (CRUD operations with MSW mocking)

## Future Enhancements (Post-MVP)

- Markdown preview toggle
- Multiple notes per node (currently MVP supports one note per node)
- Note search/filtering
- Rich text editing
- Note templates
- Export notes as markdown
- Collaborative note editing

## Related Documentation

- [MVP.md](/META/Core/MVP.md) - Feature 3 requirements
- [UIUX.md](/META/Core/UIUX.md) - Design specifications
- [TECHNICAL.md](/META/Core/TECHNICAL.md) - Architecture patterns
- [REGULATION.md](/META/Core/REGULATION.md) - Code standards
