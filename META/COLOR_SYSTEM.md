# Graphex Color System Guide

**Philosophy**: Color communicates function, type, and state. Every color has meaning.

---

## Quick Reference

### Backgrounds

```tsx
// Main app background - soft light blue
<div className="bg-background">

// Graph canvas area - lighter blue-white
<div className="bg-canvas">

// Panels, modals, cards - white for contrast
<div className="bg-chrome">
```

### Text Colors

```tsx
// Primary text - charcoal blue
<p className="text-text-primary">

// Secondary text - medium gray-blue
<p className="text-text-secondary">

// Muted text - light gray-blue
<p className="text-text-muted">
```

### Interactive Elements

```tsx
// Primary buttons, links, interactive elements
<button className="bg-primary hover:bg-primary-600">

// Primary text/icon
<span className="text-primary">
```

---

## Node Colors (By Type)

Use these to communicate what **kind** of concept a node represents:

```tsx
// Foundation/root concepts - deep blue
<div className="bg-node-root">

// Supporting concepts - medium blue
<div className="bg-node-supporting">

// Examples/applications - light cyan
<div className="bg-node-example">

// Definitions/terminology - purple
<div className="bg-node-definition">

// Questions/problems to explore - orange
<div className="bg-node-question">
```

### Example in Graph Component:

```tsx
function GraphNode({ node }: { node: Node }) {
  const colorClass = {
    root: 'bg-node-root',
    supporting: 'bg-node-supporting',
    example: 'bg-node-example',
    definition: 'bg-node-definition',
    question: 'bg-node-question',
  }[node.type];

  return (
    <div className={`${colorClass} rounded-node shadow-node hover:shadow-node-hover`}>
      {node.title}
    </div>
  );
}
```

---

## Node States

Use these to show user **interaction** or **learning progress**:

```tsx
// Node has user notes - gold border
<div className="border-2 border-state-with-notes">

// Concept mastered (after quiz) - green
<div className="bg-state-mastered">

// Needs review - red-orange
<div className="bg-state-needs-review">
```

### Example with Multiple States:

```tsx
function GraphNode({ node, hasNotes, isMastered }: NodeProps) {
  return (
    <div
      className={cn(
        'bg-node-supporting rounded-node shadow-node',
        hasNotes && 'border-2 border-state-with-notes',
        isMastered && 'bg-state-mastered'
      )}
    >
      {node.title}
    </div>
  );
}
```

---

## Edge/Relationship Colors

Use these to show **what type of relationship** connects two nodes:

```tsx
// Causal relationship ("leads to", "causes") - blue, solid, 3px
<line stroke="text-edge-causal" strokeWidth="3" />

// Definitional ("is a", "defines") - purple, solid, 2px
<line stroke="text-edge-definitional" strokeWidth="2" />

// Example ("such as") - cyan, dashed, 2px
<line stroke="text-edge-example" strokeWidth="2" strokeDasharray="4,4" />

// Contrast ("differs from") - orange, dotted, 2px
<line stroke="text-edge-contrast" strokeWidth="2" strokeDasharray="2,2" />

// General relation - gray, solid, 2px
<line stroke="text-edge-related" strokeWidth="2" />
```

### Example in Mermaid Styling:

```typescript
const edgeColors = {
  causal: '#2196F3',      // Blue
  definitional: '#9C27B0', // Purple
  example: '#00BCD4',      // Cyan
  contrast: '#FF9800',     // Orange
  related: '#90A4AE',      // Gray
};

// Apply to Mermaid edge based on relationship type
const getEdgeColor = (relationship: string) => {
  if (relationship.includes('leads to') || relationship.includes('causes')) {
    return edgeColors.causal;
  }
  if (relationship.includes('is a') || relationship.includes('defines')) {
    return edgeColors.definitional;
  }
  // ... etc
};
```

---

## Semantic Colors (Feedback)

Use these for **user feedback** and system **status**:

```tsx
// Success messages, correct answers
<div className="bg-success text-white">
<CheckIcon className="text-success" />

// Error messages, incorrect answers
<div className="bg-error text-white">
<XIcon className="text-error" />

// Warnings, review needed
<div className="bg-warning text-text-primary">

// Info messages, neutral notifications
<div className="bg-info text-white">
```

---

## Dark Mode

All colors have dark mode equivalents. Use Tailwind's `dark:` prefix:

```tsx
<div className="bg-background dark:bg-dark-background">
<div className="bg-canvas dark:bg-dark-canvas">
<div className="bg-chrome dark:bg-dark-chrome">
<p className="text-text-primary dark:text-dark-text">
```

**Important**: Keep node and edge color meanings consistent in dark mode. Only adjust brightness/saturation for readability.

---

## Common Patterns

### Button Variants

```tsx
// Primary action - bright blue
<button className="bg-primary hover:bg-primary-600 text-white">

// Secondary action - blue outline
<button className="border-2 border-primary text-primary hover:bg-primary-50">

// Tertiary action - text only
<button className="text-primary hover:underline">

// Success action
<button className="bg-success hover:bg-green-600 text-white">

// Destructive action
<button className="bg-error hover:bg-red-600 text-white">
```

### Card/Panel Styling

```tsx
<div className="bg-chrome rounded-lg shadow-lg p-6">
  <h2 className="text-text-primary font-semibold">Title</h2>
  <p className="text-text-secondary">Description</p>
</div>
```

### Node with Notes Indicator

```tsx
<div className="relative bg-node-supporting rounded-node shadow-node">
  {node.title}
  {hasNotes && (
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-state-with-notes rounded-full border-2 border-chrome" />
  )}
</div>
```

### Loading States

```tsx
// Skeleton loader - use muted primary
<div className="bg-primary-100 animate-pulse rounded h-4" />
```

### Focus Rings (Accessibility)

```tsx
// High contrast teal outline for keyboard navigation
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
```

---

## Color Meaning Legend

Display this legend in the UI to help users understand the system:

```tsx
<div className="space-y-2">
  <h3 className="font-semibold text-text-primary">Node Types</h3>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-node-root rounded" />
    <span className="text-sm text-text-secondary">Main concepts</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 bg-node-supporting rounded" />
    <span className="text-sm text-text-secondary">Supporting ideas</span>
  </div>
  {/* ... etc */}
</div>
```

---

## Best Practices

### ✅ DO:

- Use color to communicate function (node types, relationship types)
- Use color to show state (has notes, mastered, needs review)
- Maintain color meanings consistently throughout the app
- Provide a color legend for first-time users
- Combine color with icons/text (never rely on color alone)
- Use the full spectrum to make distinctions clear

### ❌ DON'T:

- Use decorative colors that don't communicate meaning
- Change color meanings between different parts of the app
- Rely solely on color for critical information
- Use too many node type colors (stick to the 5 defined types)
- Override these colors unless absolutely necessary

---

## Accessibility

- All color combinations meet WCAG AA contrast requirements
- Never use color as the only means of conveying information
- Provide text labels and icons alongside colors
- Support high contrast mode
- Allow users to customize colors if needed (future enhancement)

---

## Example: Complete Node Component

```tsx
import { cn } from '@/lib/utils';

interface GraphNodeProps {
  node: {
    id: string;
    title: string;
    type: 'root' | 'supporting' | 'example' | 'definition' | 'question';
  };
  hasNotes: boolean;
  isMastered: boolean;
  needsReview: boolean;
  onClick: () => void;
}

export function GraphNode({ node, hasNotes, isMastered, needsReview, onClick }: GraphNodeProps) {
  const typeColorClass = {
    root: 'bg-node-root',
    supporting: 'bg-node-supporting',
    example: 'bg-node-example',
    definition: 'bg-node-definition',
    question: 'bg-node-question',
  }[node.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        'relative rounded-node shadow-node p-3 transition-all duration-200',
        'text-white font-medium text-sm',
        'hover:shadow-node-hover hover:scale-105',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',

        // Type color
        typeColorClass,

        // State overrides
        isMastered && 'bg-state-mastered',
        needsReview && 'bg-state-needs-review',

        // Notes border
        hasNotes && 'border-2 border-state-with-notes'
      )}
    >
      {node.title}

      {/* Note indicator dot */}
      {hasNotes && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-state-with-notes rounded-full border-2 border-chrome" />
      )}
    </button>
  );
}
```

---

**Version**: 1.0
**Updated**: 2025-11-11
**Related**: [UIUX.md](/META/Core/UIUX.md), [tailwind.config.ts](/tailwind.config.ts)
