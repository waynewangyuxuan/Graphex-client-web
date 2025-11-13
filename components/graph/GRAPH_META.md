# Graph Visualization Components - META Documentation

**Purpose**: Interactive Mermaid.js-based graph visualization system with colorful node styling, event handling, and comprehensive controls.

**Status**: Production Ready
**Version**: 1.0
**Created**: 2025-11-11

---

## Overview

This module implements Feature 1 of the MVP: **Basic Graph Generation & Display**. It provides a complete, production-ready graph visualization system built on Mermaid.js with extensive customization, interactivity, and accessibility features.

### Core Components

1. **GraphContainer** - Main wrapper component (use this!)
2. **MermaidGraph** - Core Mermaid renderer with event handling
3. **GraphControls** - Zoom/pan/fit controls
4. **NodeLegend** - Color legend and quick guide

### Supporting Utilities

- **lib/mermaid-theme.ts** - Theme configuration and color mappings
- **lib/graph-utils.ts** - SVG manipulation and event utilities

---

## Architecture

### Component Hierarchy

```
GraphContainer (Wrapper - Use This!)
├── MermaidGraph (Core Renderer)
│   ├── Mermaid.js (SVG generation)
│   └── Event Handlers (Click, Hover, Keyboard)
├── NodeLegend (Color Guide)
└── GraphControls (Zoom/Pan)
```

### Data Flow

```
User clicks node
     ↓
1. SVG click event captured
     ↓
2. getNodeIdFromElement() extracts node ID
     ↓
3. onNodeClick callback fired
     ↓
4. Parent component updates activeNodeId
     ↓
5. applyNodeStyles() adds visual feedback
     ↓
6. Connected nodes highlighted (optional)
```

### State Management

**Component State** (React useState):
- `zoomLevel` - Current zoom level (0.1-2.0)
- `panEnabled` - Pan mode on/off
- `hoveredNodeId` - Currently hovered node
- `isRendered` - Mermaid render complete

**External State** (Props from parent):
- `activeNodeId` - Selected/active node
- `nodeStates` - Map of node IDs to states (notes, mastery, etc.)

**Why this split**: Component handles UI interactions, parent handles application logic (reading panel sync, note modals, quiz triggers).

---

## Color System

### Functional Color Philosophy

Colors carry **meaning** in this system. Every color communicates node type, relationship type, or state.

### Node Type Colors

Based on `tailwind.config.ts` and UIUX.md design system:

| Type | Color | Hex | Purpose |
|------|-------|-----|---------|
| Root | Deep Blue | #1565C0 | Foundation concepts |
| Supporting | Medium Blue | #42A5F5 | Secondary ideas |
| Example | Light Cyan | #4DD0E1 | Practical applications |
| Definition | Teal | #00897B | Terminology nodes |
| Question | Orange | #FF9800 | Areas to explore |

### Node State Colors (Overlays)

| State | Color | Hex | Visual |
|-------|-------|-----|--------|
| With Notes | Gold | #FFC107 | Border 3px |
| Mastered | Green | #66BB6A | Background fill |
| Needs Review | Red-Orange | #FF7043 | Background fill |
| Active | Blue Glow | #2196F3 | Shadow + border |
| Hovered | Scale + Shadow | - | Transform scale(1.05) |

### Edge Type Colors (Future)

| Type | Color | Hex | Style |
|------|-------|-----|-------|
| Causal | Blue | #2196F3 | Solid 3px |
| Definitional | Teal | #00897B | Solid 2px |
| Example | Cyan | #00BCD4 | Dashed 2px |
| Contrast | Orange | #FF9800 | Dotted 2px |
| Related | Gray | #90A4AE | Solid 2px |

---

## Usage Examples

### Basic Usage (Most Common)

```tsx
'use client';

import { GraphContainer } from '@/components/graph';
import { useGraph } from '@/hooks';
import { useState } from 'react';

export default function GraphViewPage({ params }: { params: { graphId: string } }) {
  const { data: graph, isLoading, error } = useGraph(params.graphId);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(nodeId);
    // Additional logic: scroll reading panel, open note modal, etc.
  };

  return (
    <div className="h-screen bg-background">
      <GraphContainer
        graphId={params.graphId}
        mermaidCode={graph?.mermaidCode || ''}
        nodes={graph?.nodes || []}
        edges={graph?.edges || []}
        onNodeClick={handleNodeClick}
        activeNodeId={activeNodeId}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
```

### Advanced Usage with Node States

```tsx
'use client';

import { GraphContainer } from '@/components/graph';
import { useGraph } from '@/hooks';
import { useNotes } from '@/hooks/useNotes'; // Local storage notes
import { useState } from 'react';

export function GraphWithStates({ graphId }: { graphId: string }) {
  const { data: graph } = useGraph(graphId);
  const { notes } = useNotes(graphId);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [masteredNodes, setMasteredNodes] = useState<Set<string>>(new Set());

  // Build node states from various sources
  const nodeStates = {};
  graph?.nodes.forEach((node) => {
    nodeStates[node.id] = {
      hasNotes: !!notes[node.id],
      isMastered: masteredNodes.has(node.id),
      needsReview: false, // From quiz results, etc.
    };
  });

  return (
    <GraphContainer
      graphId={graphId}
      mermaidCode={graph?.mermaidCode || ''}
      nodes={graph?.nodes || []}
      edges={graph?.edges || []}
      onNodeClick={setActiveNodeId}
      activeNodeId={activeNodeId}
      nodeStates={nodeStates}
    />
  );
}
```

### Using Individual Components

```tsx
import { MermaidGraph, GraphControls, NodeLegend } from '@/components/graph';

// Custom layout with manual control
function CustomGraphLayout() {
  return (
    <div className="relative w-full h-full">
      <MermaidGraph
        graphId="graph-123"
        mermaidCode={mermaidCode}
        nodes={nodes}
        edges={edges}
        onNodeClick={handleClick}
      />

      {/* Custom positioned legend */}
      <div className="absolute top-4 left-4">
        <NodeLegend initiallyExpanded={true} />
      </div>

      {/* Custom controls */}
      <div className="absolute bottom-4 left-4">
        <GraphControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFit}
          zoomLevel={zoom}
        />
      </div>
    </div>
  );
}
```

---

## Implementation Details

### Mermaid.js Integration

**Why Mermaid for MVP**:
1. Text-based syntax (AI can generate easily)
2. Automatic layout (no manual node positioning)
3. Simple integration
4. Good enough for MVP functionality

**Rendering Process**:
```typescript
// 1. Initialize Mermaid with custom theme
mermaid.initialize(getMermaidTheme());

// 2. Render to SVG
const { svg } = await mermaid.render('element-id', mermaidCode);

// 3. Insert into DOM
container.innerHTML = svg;

// 4. Query SVG elements
const svgElement = container.querySelector('svg');

// 5. Attach event handlers
attachGraphEventHandlers(svgElement, handlers);

// 6. Apply dynamic styling
applyNodeStyles(svgElement, nodeStates);
```

### Event Handler Pattern

**Problem**: Mermaid generates static SVG. We need to attach JavaScript event handlers.

**Solution**: Post-render DOM manipulation.

```typescript
function attachGraphEventHandlers(svg: SVGSVGElement, handlers: GraphEventHandlers) {
  const listeners = [];

  // Query all node elements
  const nodes = svg.querySelectorAll('.node');

  nodes.forEach((node) => {
    // Extract node ID from element
    const nodeId = getNodeIdFromElement(node);

    // Attach click handler
    const clickHandler = () => handlers.onNodeClick?.(nodeId);
    node.addEventListener('click', clickHandler);

    // Store for cleanup
    listeners.push({ element: node, event: 'click', handler: clickHandler });
  });

  // Return cleanup function
  return () => {
    listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
  };
}
```

**Memory Management**: Always call cleanup function on unmount to prevent memory leaks.

### Dynamic Styling Pattern

**Problem**: Node states change (user adds notes, masters concepts). SVG needs to update visually.

**Solution**: Direct SVG attribute manipulation.

```typescript
function applyNodeStyles(svg: SVGSVGElement, nodeStates: Record<string, NodeState>) {
  const nodes = svg.querySelectorAll('.node');

  nodes.forEach((node) => {
    const nodeId = getNodeIdFromElement(node);
    const state = nodeStates[nodeId];

    // Find shape element (rect, circle, etc.)
    const shape = node.querySelector('rect, circle, polygon');

    // Apply state-based styling
    if (state?.hasNotes) {
      shape.setAttribute('stroke', NODE_STATE_COLORS.withNotes);
      shape.setAttribute('stroke-width', '3');
    }

    if (state?.isMastered) {
      shape.setAttribute('fill', NODE_STATE_COLORS.mastered);
    }
  });
}
```

### Connected Node Highlighting

**User Experience**: When hovering a node, highlight connected nodes and dim others.

```typescript
function highlightConnectedNodes(svg: SVGSVGElement, nodeId: string | null) {
  const nodes = svg.querySelectorAll('.node');
  const edges = svg.querySelectorAll('.edgePath');

  if (!nodeId) {
    // Clear highlights - reset all to full opacity
    nodes.forEach(n => n.style.opacity = '1');
    edges.forEach(e => e.style.opacity = '1');
    return;
  }

  // Find connected edges
  const connectedNodeIds = new Set([nodeId]);
  edges.forEach((edge) => {
    const [from, to] = getEdgeConnections(edge);
    if (from === nodeId || to === nodeId) {
      connectedNodeIds.add(from);
      connectedNodeIds.add(to);
      edge.style.opacity = '1';
    } else {
      edge.style.opacity = '0.3'; // Dim unconnected edges
    }
  });

  // Highlight connected nodes
  nodes.forEach((node) => {
    const nId = getNodeIdFromElement(node);
    node.style.opacity = connectedNodeIds.has(nId) ? '1' : '0.3';
  });
}
```

---

## Accessibility

### WCAG AA Compliance

**Keyboard Navigation**:
- All nodes are `role="button"` and `tabindex="0"`
- Space/Enter keys trigger node click
- Tab to navigate between nodes
- Focus indicators visible (3px teal outline)

**Screen Reader Support**:
- Graph has `role="img"` with descriptive `aria-label`
- Nodes have `aria-label` describing concept
- Live regions announce state changes
- All controls have proper ARIA attributes

**Visual Accessibility**:
- High contrast colors (WCAG AA)
- Color is not the only indicator (borders, text, icons)
- Focus states clearly visible
- Zoom up to 200% without breaking layout

**Example ARIA Labels**:
```typescript
// Graph
<div role="img" aria-label="Knowledge graph with 12 concepts and 15 connections">

// Node
<g role="button" tabindex="0" aria-label="Concept: Neural Networks. Click to read.">

// Control
<button aria-label="Zoom in" title="Zoom in">
```

---

## Performance Considerations

### Rendering Performance

**Initial Render**:
- Mermaid renders to string (fast)
- DOM insertion (fast)
- Event handler attachment (O(n) where n = node count)

**Re-render Strategy**:
- Only re-render when `mermaidCode` changes
- Dynamic styling does NOT re-render entire graph
- Uses direct DOM manipulation for state changes

**Optimization**:
```typescript
// Use useCallback for event handlers
const handleNodeClick = useCallback((nodeId: string) => {
  // Handler logic
}, [dependencies]);

// Memoize node states
const nodeStates = useMemo(() => {
  // Build states
  return states;
}, [notes, masteredNodes]);
```

### Memory Management

**Event Listener Cleanup**:
```typescript
useEffect(() => {
  const cleanup = attachGraphEventHandlers(svg, handlers);

  return () => {
    cleanup(); // Remove all listeners on unmount
  };
}, [svg, handlers]);
```

**Large Graphs** (>100 nodes):
- Consider virtualization (post-MVP)
- Debounce hover events
- Throttle scroll/resize handlers

---

## Testing Strategy

### Unit Tests

**Test Coverage**:
- Utility functions (getNodeIdFromElement, applyNodeStyles)
- Event handler attachment/cleanup
- Style application logic
- Theme configuration

**Example**:
```typescript
describe('graph-utils', () => {
  it('extracts node ID from element', () => {
    const element = document.createElement('g');
    element.setAttribute('class', 'node-A');
    expect(getNodeIdFromElement(element)).toBe('A');
  });

  it('applies node styles correctly', () => {
    const svg = createMockSVG();
    applyNodeStyles(svg, { 'node-1': { hasNotes: true } });
    const shape = svg.querySelector('.node-1 rect');
    expect(shape.getAttribute('stroke')).toBe('#FFC107');
  });
});
```

### Integration Tests

**Test Scenarios**:
- Graph renders with correct number of nodes
- Click handler fires with correct node ID
- Hover highlights connected nodes
- Zoom/pan controls work correctly

**Example with React Testing Library**:
```typescript
describe('MermaidGraph', () => {
  it('calls onNodeClick when node is clicked', async () => {
    const handleClick = jest.fn();
    render(
      <MermaidGraph
        graphId="test"
        mermaidCode="graph TD; A[Node A]"
        nodes={[{ id: 'A', title: 'Node A', ... }]}
        edges={[]}
        onNodeClick={handleClick}
      />
    );

    // Wait for render
    await waitFor(() => expect(screen.getByRole('img')).toBeInTheDocument());

    // Click node
    const node = screen.getByLabelText(/Node A/);
    fireEvent.click(node);

    expect(handleClick).toHaveBeenCalledWith('A');
  });
});
```

### Visual Regression Tests (Future)

Use Percy or Chromatic to catch visual changes.

---

## Migration Path to React Flow

**Current State**: Mermaid.js (MVP)
**Future State**: React Flow (Post-MVP)

**Why Migrate**:
- Drag-and-drop node repositioning
- Better zoom/pan performance
- More flexible layout algorithms
- Built-in minimap

**Migration Strategy**:
1. Create `ReactFlowGraph` component with same props interface as `MermaidGraph`
2. Update `GraphContainer` to conditionally render based on feature flag
3. Maintain both implementations during transition
4. Deprecate Mermaid once React Flow is stable

**Interface Compatibility**:
```typescript
// Both components share same interface
interface GraphProps {
  graphId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  // ...
}

// Can swap implementations
const GraphRenderer = USE_REACT_FLOW ? ReactFlowGraph : MermaidGraph;
```

---

## Common Patterns

### Pattern: Sync Graph with Reading Panel

```typescript
function GraphWithReadingPanel({ graphId }) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const readingPanelRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(nodeId);

    // Scroll reading panel to node content
    const node = graph.nodes.find(n => n.id === nodeId);
    if (node && readingPanelRef.current) {
      const position = node.documentRefs[0]?.start || 0;
      scrollToPosition(readingPanelRef.current, position);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-3/5">
        <GraphContainer
          graphId={graphId}
          onNodeClick={handleNodeClick}
          activeNodeId={activeNodeId}
          // ...
        />
      </div>
      <div ref={readingPanelRef} className="w-2/5 overflow-y-auto">
        <ReadingPanel />
      </div>
    </div>
  );
}
```

### Pattern: Track Interactions for Quiz Trigger

```typescript
function GraphWithQuizTrigger({ graphId }) {
  const [interactedNodeIds, setInteractedNodeIds] = useState<Set<string>>(new Set());
  const [showQuizBanner, setShowQuizBanner] = useState(false);

  const handleNodeClick = (nodeId: string) => {
    const updated = new Set(interactedNodeIds);
    updated.add(nodeId);
    setInteractedNodeIds(updated);

    // Trigger quiz after 5 nodes
    if (updated.size >= 5) {
      setShowQuizBanner(true);
    }
  };

  return (
    <>
      <GraphContainer
        graphId={graphId}
        onNodeClick={handleNodeClick}
        // ...
      />
      {showQuizBanner && <QuizBanner onStart={handleQuizStart} />}
    </>
  );
}
```

### Pattern: Persist Node States in Local Storage

```typescript
function GraphWithPersistentStates({ graphId }) {
  const [nodeStates, setNodeStates] = useLocalStorage<Record<string, NodeState>>(
    `graph-states-${graphId}`,
    {}
  );

  const markAsMastered = (nodeId: string) => {
    setNodeStates((prev) => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], isMastered: true },
    }));
  };

  return (
    <GraphContainer
      graphId={graphId}
      nodeStates={nodeStates}
      // ...
    />
  );
}
```

---

## Troubleshooting

### Issue: Graph Not Rendering

**Symptoms**: Blank screen, "Rendering graph..." never completes

**Causes & Solutions**:
1. **Invalid Mermaid syntax**: Check `mermaidCode` in console
   - Solution: Validate syntax before passing to component
2. **Mermaid initialization failed**: Check browser console for errors
   - Solution: Ensure `mermaid` package is installed
3. **Container has no height**: Parent element needs explicit height
   - Solution: Add `h-screen` or `h-full` to parent

### Issue: Click Handlers Not Firing

**Symptoms**: Clicking nodes does nothing

**Causes & Solutions**:
1. **Event handlers not attached**: Check `isRendered` state
   - Solution: Ensure `attachGraphEventHandlers` runs after render
2. **Mermaid version incompatibility**: SVG structure changed
   - Solution: Check Mermaid version, update selector queries
3. **Z-index issues**: Another element is capturing clicks
   - Solution: Check CSS stacking context

### Issue: Node Styles Not Updating

**Symptoms**: Node states change but visual doesn't update

**Causes & Solutions**:
1. **nodeStates prop not updating**: Check React DevTools
   - Solution: Ensure parent component updates prop correctly
2. **Reference equality**: Same object reference, React doesn't re-render
   - Solution: Create new object: `{ ...nodeStates }`
3. **SVG element not found**: querySelector fails
   - Solution: Verify node ID format matches Mermaid output

### Issue: Memory Leak

**Symptoms**: Browser slows down after multiple renders

**Causes & Solutions**:
1. **Event listeners not cleaned up**: Check cleanup function
   - Solution: Ensure `useEffect` returns cleanup function
2. **SVG refs not cleared**: Old SVG elements retained
   - Solution: Set `svgRef.current = null` on unmount

---

## Future Enhancements

### Post-MVP Features

1. **Minimap** - Small overview in corner for large graphs
2. **Search/Filter** - Highlight nodes matching search query
3. **Node Grouping** - Collapse/expand clusters
4. **Export** - Download graph as PNG/SVG
5. **Custom Layouts** - User-defined positioning (requires React Flow)
6. **Edge Labels** - Show relationship types on hover
7. **Progressive Disclosure** - Show/hide complexity levels
8. **Annotations** - User-drawn arrows and highlights
9. **Time Travel** - Replay learning journey
10. **Collaboration** - Multi-user cursors and highlights

### Technical Debt

- [ ] Add comprehensive E2E tests
- [ ] Optimize for graphs >100 nodes (virtualization)
- [ ] Add bundle size budget monitoring
- [ ] Create Storybook stories
- [ ] Document all edge cases in tests

---

## Related Files

- **Components**: `MermaidGraph.tsx`, `GraphControls.tsx`, `NodeLegend.tsx`, `GraphContainer.tsx`
- **Utilities**: `lib/mermaid-theme.ts`, `lib/graph-utils.ts`
- **Types**: `types/api.types.ts` (GraphNode, GraphEdge)
- **Hooks**: `hooks/useGraph.ts` (data fetching)
- **Design**: `META/Core/UIUX.md`, `tailwind.config.ts`

---

## Change Log

**v1.0 - 2025-11-11**
- Initial implementation
- Mermaid.js integration
- Colorful node styling
- Interactive event handlers
- Zoom/pan controls
- Color legend
- Accessibility compliance
- Complete documentation

---

**Maintainer**: Frontend Team
**Contact**: See CLAUDE.md for workflow
**Last Updated**: 2025-11-11
