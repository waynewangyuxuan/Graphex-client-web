# Graph Visualization Components - Quick Start Guide

This is a 5-minute guide to get you up and running with the graph visualization system.

---

## Installation Complete

All dependencies are already installed. The following package is required:
- ✅ `mermaid` (v11.12.1) - Already in package.json

---

## Basic Usage (Copy & Paste)

### Step 1: Import the Component

```tsx
import { GraphContainer } from '@/components/graph';
```

### Step 2: Use in Your Page

```tsx
'use client';

import { GraphContainer } from '@/components/graph';
import { useGraph } from '@/hooks';
import { useState } from 'react';

export default function GraphPage({ params }: { params: { graphId: string } }) {
  const { data: graph, isLoading, error } = useGraph(params.graphId);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  return (
    <div className="h-screen bg-background">
      <GraphContainer
        graphId={params.graphId}
        mermaidCode={graph?.mermaidCode || ''}
        nodes={graph?.nodes || []}
        edges={graph?.edges || []}
        onNodeClick={setActiveNodeId}
        activeNodeId={activeNodeId}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
```

That's it! You now have a fully functional, colorful, interactive graph.

---

## What You Get Out of the Box

- ✅ **Colorful nodes** - Type-based colors (root, supporting, example, definition, question)
- ✅ **Interactive** - Click nodes, hover to highlight connections
- ✅ **Accessible** - Keyboard navigation, screen reader support
- ✅ **Controls** - Zoom in/out, pan mode, fit to screen
- ✅ **Legend** - Color guide with quick tips
- ✅ **Loading states** - Skeleton, error, empty states
- ✅ **Responsive** - Works on all screen sizes

---

## Common Scenarios

### Scenario 1: Track Node Interactions (Quiz Trigger)

```tsx
const [interactedNodes, setInteractedNodes] = useState<Set<string>>(new Set());

const handleNodeClick = (nodeId: string) => {
  const updated = new Set(interactedNodes);
  updated.add(nodeId);
  setInteractedNodes(updated);

  // Trigger quiz after 5 nodes
  if (updated.size >= 5) {
    showQuizBanner();
  }
};

<GraphContainer onNodeClick={handleNodeClick} {...props} />
```

### Scenario 2: Show Node States (Notes, Mastery)

```tsx
const { notes } = useNotes(graphId);
const [masteredNodes, setMasteredNodes] = useState<Set<string>>(new Set());

const nodeStates = {};
Object.keys(notes).forEach(nodeId => {
  nodeStates[nodeId] = { hasNotes: true };
});
masteredNodes.forEach(nodeId => {
  nodeStates[nodeId] = { ...nodeStates[nodeId], isMastered: true };
});

<GraphContainer nodeStates={nodeStates} {...props} />
```

### Scenario 3: Sync with Reading Panel

```tsx
const handleNodeClick = (nodeId: string) => {
  setActiveNodeId(nodeId);

  // Scroll reading panel to node's content
  const element = document.getElementById(`content-${nodeId}`);
  element?.scrollIntoView({ behavior: 'smooth' });
};

<div className="flex h-screen">
  <div className="w-3/5">
    <GraphContainer onNodeClick={handleNodeClick} {...props} />
  </div>
  <div className="w-2/5 overflow-y-auto">
    <ReadingPanel />
  </div>
</div>
```

---

## Customization

### Hide Controls/Legend

```tsx
<GraphContainer
  showControls={false}
  showLegend={false}
  {...props}
/>
```

### Custom Empty Message

```tsx
<GraphContainer
  emptyMessage="Upload a document to start visualizing knowledge"
  {...props}
/>
```

---

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `graphId` | string | ✅ | Unique graph identifier |
| `mermaidCode` | string | ✅ | Mermaid syntax for graph |
| `nodes` | GraphNode[] | ✅ | Array of node objects |
| `edges` | GraphEdge[] | ✅ | Array of edge objects |
| `onNodeClick` | (nodeId: string) => void | Optional | Node click handler |
| `onEdgeClick` | (edgeId: string) => void | Optional | Edge click handler |
| `activeNodeId` | string \| null | Optional | Currently selected node |
| `nodeStates` | Record<string, NodeState> | Optional | Node visual states |
| `isLoading` | boolean | Optional | Show loading skeleton |
| `error` | Error \| string \| null | Optional | Show error state |
| `showLegend` | boolean | Optional | Show color legend (default: true) |
| `showControls` | boolean | Optional | Show zoom controls (default: true) |

---

## NodeState Interface

```typescript
interface NodeState {
  hasNotes?: boolean;       // Show gold border
  isMastered?: boolean;     // Show green background
  needsReview?: boolean;    // Show red-orange background
  isActive?: boolean;       // Show active border (auto-set)
  isHovered?: boolean;      // Show hover effect (auto-set)
}
```

---

## File Structure

```
components/graph/
├── GraphContainer.tsx         # ⭐ Use this! Main wrapper component
├── MermaidGraph.tsx           # Core renderer (used internally)
├── GraphControls.tsx          # Zoom/pan controls (used internally)
├── NodeLegend.tsx            # Color legend (used internally)
├── index.ts                  # Exports
├── GRAPH_META.md             # Detailed documentation
├── QUICKSTART.md             # This file
└── GraphContainer.example.tsx # More examples

lib/
├── mermaid-theme.ts          # Theme configuration
└── graph-utils.ts            # SVG manipulation utilities
```

---

## Examples

See `GraphContainer.example.tsx` for 6 complete examples:
1. Basic usage
2. With node states (notes, mastery)
3. Loading/error states
4. Synchronized with reading panel
5. Quiz trigger after 5 interactions
6. Custom controls position

---

## Keyboard Shortcuts

When graph is focused:
- **Tab** - Navigate between nodes
- **Enter/Space** - Click focused node
- **+** - Zoom in
- **-** - Zoom out
- **0** - Fit to screen
- **Space** (hold) - Pan mode

---

## Accessibility

All components are WCAG AA compliant:
- ✅ Keyboard navigable
- ✅ Screen reader announcements
- ✅ High contrast colors
- ✅ Focus indicators
- ✅ ARIA labels

---

## Troubleshooting

**Graph not rendering?**
- Check that parent has explicit height (add `h-screen` or `h-full`)
- Verify `mermaidCode` is valid Mermaid syntax
- Check browser console for errors

**Click handlers not firing?**
- Ensure `onNodeClick` is passed to `GraphContainer`
- Check that nodes have valid IDs

**Styles not updating?**
- Create new `nodeStates` object (don't mutate): `{ ...nodeStates }`
- Verify node IDs match graph node keys

---

## Need More Help?

1. **Detailed docs**: See `GRAPH_META.md`
2. **Examples**: See `GraphContainer.example.tsx`
3. **Design system**: See `/META/Core/UIUX.md`
4. **API types**: See `/types/api.types.ts`

---

## Next Steps

1. ✅ Copy the basic usage code above
2. ✅ Replace `params.graphId` with your graph ID
3. ✅ Implement `onNodeClick` handler
4. ✅ Add node states for enhanced UX
5. ✅ Sync with reading panel
6. ✅ Track interactions for quiz trigger

You're ready to build! 🚀
