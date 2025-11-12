# Connection Modal Components

**Feature 4: Pre-Explanation Retrieval** - Modal system for explaining connections between nodes in the knowledge graph.

## Overview

This implements the cognitive science principle of **pre-explanation retrieval**, which:
- Prevents fluency illusion (thinking you understand when you don't)
- Activates prior knowledge before seeing explanations
- Provides **30% retention boost** according to research
- Forces active engagement with learning material

## Two-Step Flow

### Step 1: Hypothesis Input
User writes their hypothesis about why two concepts are connected:
- Minimum 50 characters required (enforced with validation)
- Real-time character counter with color coding
- Gentle shake animation if invalid submission attempted
- Helpful prompts to guide thinking

### Step 2: AI Explanation Reveal
After submission, show:
- User's hypothesis (locked and grayed out)
- AI-generated explanation with source references
- Relevant passages from source document
- Reflection prompt for self-explanation

## Components

### ConnectionModal
Main modal component orchestrating the two-step flow.

**Props:**
```typescript
interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphId: string;
  fromNodeId: string;
  toNodeId: string;
  fromNodeTitle: string;
  toNodeTitle: string;
  relationshipLabel?: string;
}
```

**Usage:**
```tsx
import { ConnectionModal } from '@/components/connections';

const [modalState, setModalState] = useState({
  isOpen: false,
  fromNodeId: '',
  toNodeId: '',
  fromNodeTitle: '',
  toNodeTitle: '',
  relationshipLabel: '',
});

// Handle edge click
const handleEdgeClick = (edge: GraphEdge) => {
  const fromNode = graph.nodes.find(n => n.id === edge.fromNodeId);
  const toNode = graph.nodes.find(n => n.id === edge.toNodeId);

  setModalState({
    isOpen: true,
    fromNodeId: edge.fromNodeId,
    toNodeId: edge.toNodeId,
    fromNodeTitle: fromNode.title,
    toNodeTitle: toNode.title,
    relationshipLabel: edge.relationship,
  });
};

<ConnectionModal
  {...modalState}
  graphId={graphId}
  onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
/>
```

### ConnectionDetails
Shows from/to nodes with relationship label and arrow.

**Features:**
- Color-coded by relationship type (matches edge colors)
- Visual arrow representation
- Truncation for long titles

### HypothesisInput
Textarea with validation and character counting.

**Features:**
- Minimum 50 characters validation
- Character counter: Red < 50, Green >= 50
- Shake animation on invalid submit
- Disabled state after submission
- Helpful placeholder and prompts

### AIExplanation
Displays AI explanation with source references.

**Features:**
- Smooth fade-in animation (300ms)
- AI icon indicator
- Source text passages with position markers
- Reflection prompt

## Design System Integration

### Colors
Follows UIUX.md specifications:
- Background: `bg-primary-50` (light blue)
- Border: `border-primary`
- Error text: `text-error`
- Success indicators: `text-success`
- Relationship colors: Maps to edge color system

### Typography
- Modal title: `text-lg font-semibold`
- Node titles: `text-base font-semibold`
- User input: `font-sans text-base`
- AI explanation: `font-serif text-base` (better readability)
- Helper text: `text-sm text-text-secondary`

### Animations
- Modal: Slide from bottom (400ms)
- AI explanation reveal: Fade in (300ms)
- Shake on error: 500ms horizontal shake
- Character counter: Smooth color transitions

### Spacing
- Modal padding: `p-8`
- Section spacing: `space-y-6`
- Component gaps: `gap-3` or `gap-4`

## Accessibility

### ARIA Attributes
- Dialog properly announced with role="dialog"
- Textarea has aria-label and aria-describedby
- Character counter has aria-live="polite"
- AI explanation marked with role="article"

### Keyboard Navigation
- ESC closes modal
- Tab cycles through focusable elements
- Cmd/Ctrl + Enter submits (when valid)
- Submit button disabled when invalid

### Focus Management
- Textarea auto-focused on modal open
- Focus returns to trigger element on close
- Clear focus indicators (ring-2 ring-primary)

## Validation

### Client-side Validation
```typescript
import { z } from 'zod';

const hypothesisSchema = z.object({
  hypothesis: z.string()
    .min(50, 'Please write at least 50 characters')
    .max(1000, 'Hypothesis cannot exceed 1000 characters'),
});
```

### Validation States
- **Empty** (0 chars): Muted gray counter, button disabled
- **Too short** (< 50 chars): Red counter, error message, button disabled
- **Valid** (50-900 chars): Green counter, button enabled
- **Near max** (900+ chars): Warning color
- **Max** (1000 chars): Error color, input stops accepting

## API Integration

Uses `useExplainConnection` hook from `@/hooks`:

```typescript
import { useExplainConnection } from '@/hooks';

const explainMutation = useExplainConnection({
  onSuccess: (data) => {
    // Move to explanation step
    setStep('explanation');
  },
  onError: (error) => {
    // Show error toast
    toast.error(error.message);
  },
});

// Submit with hypothesis
explainMutation.mutate({
  fromNodeId,
  toNodeId,
  userHypothesis: hypothesis,
});
```

**API Endpoint:** `POST /api/v1/connections/explain`

**Request:**
```typescript
{
  fromNodeId: string;
  toNodeId: string;
  userHypothesis?: string; // MVP: Optional, send but not evaluated
}
```

**Response:**
```typescript
{
  fromNode: string;
  toNode: string;
  relationship: string;
  explanation: string;
  sourceReferences: DocumentReference[];
  userHypothesisEvaluation?: HypothesisEvaluation; // MVP: Skip this
}
```

## Testing

Comprehensive test suite in `__tests__/components/connections/ConnectionModal.test.tsx`

**Test Coverage:**
- Rendering and display
- Validation logic
- Hypothesis submission
- API integration with MSW
- Error handling
- Modal interactions (open/close)
- Accessibility attributes
- Edge cases (long titles, empty refs)

**Run tests:**
```bash
npm test -- ConnectionModal.test.tsx
```

## State Management

### Local State
- `step`: 'hypothesis' | 'explanation'
- `hypothesis`: string (user input)
- `showValidationError`: boolean
- `shouldShake`: boolean

### Server State (React Query)
- Mutation: `useExplainConnection`
- States: `isPending`, `isSuccess`, `isError`, `data`

### State Reset
Modal state resets 300ms after close (allows exit animation):
- Step → 'hypothesis'
- Hypothesis → ''
- Validation errors cleared
- Mutation reset

## Performance

- Modal renders only when open (conditional)
- Components are memoizable (pure)
- Animations use GPU-accelerated transforms
- No heavy computations in render cycle
- Debounced character counting (via React state)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Touch-friendly (tested on iOS Safari, Chrome Android)

## Future Enhancements (Post-MVP)

1. **Hypothesis Evaluation**: Show AI's assessment of user's hypothesis
   - Match level: "full", "partial", "incorrect"
   - Constructive feedback
   - Highlight similarities/differences

2. **Save Hypotheses**: Store for review and reflection
   - Compare across connections
   - Track learning progress
   - Export as study notes

3. **Hypothesis Hints**: Progressive disclosure system
   - Hint 1: General direction
   - Hint 2: More specific guidance
   - Full explanation after 2 hints

4. **Collaborative Hypotheses**: See peer explanations
   - Anonymous aggregated responses
   - Voting on best explanations
   - Discussion threads

5. **Audio Explanations**: TTS for accessibility
   - Listen to AI explanation
   - Record own verbal hypothesis

## Related Files

- **API Hook**: `/hooks/useConnection.ts`
- **API Client**: `/lib/api/connections.ts`
- **Types**: `/types/api.types.ts`
- **Tests**: `/__tests__/components/connections/`
- **Example**: `./ConnectionModal.example.tsx`

## Documentation References

- **MVP Spec**: `/META/Core/MVP.md` (Feature 4)
- **Design System**: `/META/Core/UIUX.md` (Edge interactions)
- **Architecture**: `/META/Core/TECHNICAL.md` (Component patterns)
- **Coding Standards**: `/META/Core/REGULATION.md`

## Cognitive Science Background

**Pre-Explanation Retrieval** is based on research showing:
- Generating explanations activates relevant prior knowledge
- Comparison between self-explanation and expert explanation deepens understanding
- Metacognitive awareness improves when you see gaps in your thinking
- Active retrieval strengthens memory traces more than passive reading

**Key Papers:**
- Chi, M. T. H. (2000). Self-explaining expository texts
- Dunlosky et al. (2013). Improving students' learning with effective learning techniques
- Karpicke & Blunt (2011). Retrieval practice produces more learning than elaborative studying

---

**Version**: 1.0
**Last Updated**: 2025-11-12
**Status**: Production Ready
