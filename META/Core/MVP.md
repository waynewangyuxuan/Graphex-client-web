# MVP Feature Prioritization (2-Week Sprint)
# Graphex Frontend MVP Implementation Guide
## For Claude Code

**Version:** 2.1  
**Purpose:** This document describes the frontend implementation for Graphex, a knowledge graph application. It is written for an AI coding assistant to implement.

---

## 1. Project Overview

### What We're Building

Graphex is a reading tool that transforms PDF documents into interactive knowledge graphs. The core user experience is a split-view interface where users see a knowledge graph on one side and the source document on the other. When users interact with either side, the other side updates to stay in sync.

### Core Concept: Knowledge Entity

A Knowledge Entity is the fundamental data unit. It represents one document that has been processed into a knowledge graph. Each Knowledge Entity contains:

- A knowledge graph (nodes representing concepts, edges representing relationships)
- The source document (the original PDF)
- Extracted content (the text content structured into sections for the formatted view)
- Metadata (title, creation date, folder location, tags)

### Visual Aesthetic

The application uses a retro aesthetic inspired by Windows 3.1 and early Macintosh interfaces. This means:

- Monospace fonts (IBM Plex Mono)
- 2-pixel beveled borders that create a 3D effect (light color on top/left, dark on bottom/right)
- System gray backgrounds (#ECECEC for windows, #008080 teal for desktop)
- Classic blue title bars with white text
- No rounded corners, no gradients except on title bars
- ASCII-style decorators for section headers (using ═ and ─ characters)

---

## 2. Technical Stack

### Dependencies

Use React 18 with TypeScript. For the graph visualization, use React Flow which provides pan, zoom, and custom node rendering. For automatic graph layout, use Dagre which calculates node positions based on edge relationships. For PDF rendering, use react-pdf which wraps PDF.js. For routing between pages, use React Router. For mocking API responses during development, use MSW (Mock Service Worker). Use Vite as the build tool.

### State Management

Keep state management simple. Use React's useState for component-local state and useContext for shared state that needs to cross component boundaries. The main shared state is:

- `activeNodeId`: The currently selected node, shared between graph and source viewer
- `viewMode`: Either "pdf" or "formatted", controls which source view is displayed
- `syncSource`: Either "graph" or "source" or null, indicates which side triggered the last sync

---

## 3. Data Schemas

### Knowledge Entity Schema

```typescript
interface KnowledgeEntity {
  id: string;
  title: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  modifiedAt: string;
  stats: {
    nodeCount: number;
    edgeCount: number;
    pageCount: number;
  };
  graph: {
    nodes: Node[];
    edges: Edge[];
  };
  source: {
    pdfUrl: string;
    content: ExtractedContent;
  };
}
```

### Node Schema

Each node represents a concept extracted from the document. It contains source anchoring information that links it back to the original document location.

```typescript
interface Node {
  id: string;
  label: string;
  type: "concept" | "key" | "entity" | "event";
  source: {
    sectionId: string;
    pageNumber: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    text: string;
  };
}
```

The boundingBox coordinates are normalized between 0 and 1, representing percentages of the page dimensions. This allows them to scale correctly regardless of the rendered PDF size.

### Edge Schema

```typescript
interface Edge {
  id: string;
  source: string;
  target: string;
  relation: string;
}
```

### Extracted Content Schema

The extracted content represents the document's text broken into sections. This powers the Formatted View mode.

```typescript
interface ExtractedContent {
  sections: Section[];
}

interface Section {
  id: string;
  type: "heading" | "paragraph" | "list" | "table" | "image";
  level?: number;
  content: string;
  pageNumber: number;
  nodeId: string | null;
}
```

When a section has a non-null nodeId, it means that section is the source text for that node in the graph.

### Folder Schema

```typescript
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
}
```

---

## 4. Application Pages

### Page 1: Dashboard

The Dashboard is the home page and library view. It displays all Knowledge Entities organized into folders.

**Route:** `/` or `/dashboard`

**Layout Description:**

The Dashboard fills the viewport and is contained within a retro-styled window. The window has a blue title bar displaying "GRAPHEX.EXE — Library" with minimize, maximize, and close buttons on the right side of the title bar.

Below the title bar is a simple menu bar with items: File, Edit, View, Help. These are placeholder and don't need functional dropdowns for MVP.

The main content area is split into two columns. The left column takes approximately 180 pixels width and contains the folder tree. The right column takes the remaining space and contains the entity list.

**Folder Tree (Left Column):**

At the top of the left column is a section header that reads "═ FOLDERS ═" in the retro style.

Below this is a tree view of folders. The first item is "All Items" which is a virtual folder that shows all entities regardless of folder. Below this are the actual folders, displayed hierarchically. Each folder can be expanded or collapsed by clicking on it. Expanded folders show a down-pointing triangle indicator, collapsed folders show a right-pointing triangle.

Folders can be nested. Child folders are indented under their parent with a visual connector line.

At the bottom of the folder tree is a button labeled "+ New Folder" that creates a new folder.

**Entity List (Right Column):**

At the top of the right column is a section header "═ KNOWLEDGE ENTITIES ═" with a "+ New" button aligned to the right.

Below this is a table displaying all entities in the currently selected folder (or all entities if "All Items" is selected). The table has these columns: a checkbox column for selection, Name, Nodes (the node count), and Modified (relative time like "2h ago").

Table rows are clickable. Single click selects a row (shows selection highlight). Double click opens the entity in the Entity Viewer.

When rows are selected, action buttons appear below the table: Open, Move to..., Delete.

The table should support sorting by clicking column headers.

**Status Bar:**

At the bottom of the window is a status bar showing: "Ready", entity count, total node count across all entities.

**Behavior:**

When the user clicks a folder in the tree, the entity list filters to show only entities in that folder and its subfolders. The folder tree should highlight the currently selected folder.

Clicking "+ New Folder" should prompt for a folder name (can be a simple browser prompt for MVP) and create the folder.

Double-clicking an entity row navigates to `/entity/{entityId}`.

---

### Page 2: Entity Viewer

The Entity Viewer displays a single Knowledge Entity with its graph and source document side by side.

**Route:** `/entity/:id`

**Layout Description:**

Like the Dashboard, this fills the viewport in a retro window. The title bar shows "GRAPHEX.EXE — {Entity Title}".

Below the title bar is a toolbar. The toolbar contains:
- A view mode toggle with two buttons: "PDF" and "Formatted". One is always active (shown with inverted colors or pressed state). This controls which source view is displayed.
- A sync indicator showing which direction sync last occurred, like "Sync: Graph → Source" or "Sync: Source → Graph"
- Spacing, then on the right side: node count and edge count

The main content area is a horizontal split view. The left panel contains the graph, the right panel contains the source viewer. Between them is a draggable resize handle.

**Graph Panel (Left):**

The panel has a small header bar with gray background labeled "KNOWLEDGE GRAPH".

Below this is the graph canvas. The canvas should have a subtle grid pattern background. The graph displays nodes and edges using React Flow. Each node is rendered with the retro style: 2-pixel black border, cream background, monospace text showing the node label. Node type is indicated by a symbol prefix: ★ for key nodes, ○ for concept nodes, ● for entity nodes, ⚠ for event nodes.

The currently active node (the one synced with the source viewer) should have a distinct visual style: blue background with white text, and a subtle glow or highlight effect.

Edges are drawn as lines between nodes. When a node is active, all edges connected to that node should also be highlighted (thicker line weight, different color like amber).

The graph should support panning by dragging the background and zooming with scroll wheel. React Flow provides this.

Node positions should be automatically calculated using Dagre when the graph first loads. Use a left-to-right layout direction.

**Source Panel (Right):**

The panel has a header bar labeled either "PDF VIEWER" or "FORMATTED VIEW" depending on the current mode.

**PDF Mode (Original PDF View):**

When in PDF mode, this panel renders the actual PDF file. Use react-pdf to render each page. The pages should be scrollable vertically.

When a node is active, the corresponding location in the PDF should be highlighted. This is done by rendering a semi-transparent overlay rectangle at the position specified by the node's boundingBox. The overlay should have an amber/yellow background color with an amber border.

The PDF viewer needs to track scroll position to detect which anchor is currently in view for the reverse sync (PDF to graph).

**Formatted Mode (Extracted Content View):**

When in Formatted mode, this panel renders the extracted content as styled HTML sections. Each section from the ExtractedContent is rendered as a block.

Heading sections render as styled headers with appropriate sizing based on level.

Paragraph sections render as text blocks. Each block should have a clear visual boundary. Sections that have a nodeId (meaning they're linked to a graph node) should display a small node indicator on the right side showing the node type symbol.

The currently active section (the one whose nodeId matches activeNodeId) should have a distinct visual style: amber left border, light amber background, and the node indicator should be highlighted.

**Two-Way Synchronization:**

This is the core interaction pattern and must work smoothly in both directions.

**Graph to Source sync:** When the user clicks a node in the graph, the source panel should scroll to show the corresponding content. In PDF mode, this means scrolling to the page and position indicated by the node's pageNumber and boundingBox. In Formatted mode, this means scrolling to the section indicated by the node's sectionId. After scrolling, the corresponding content should be highlighted.

**Source to Graph sync:** When the user scrolls through the source content, the graph should update to highlight the node corresponding to the currently visible content. The detection logic should find which anchor point (in PDF mode) or which section (in Formatted mode) is closest to the vertical center of the scroll container. When this changes, update activeNodeId to the corresponding node.

**Preventing feedback loops:** When sync is triggered by a graph click, temporarily disable the scroll-based sync detection for about 500ms. This prevents the programmatic scroll from immediately triggering a reverse sync. Use a ref to track this state.

**Status Bar:**

Shows: sync status, active node name, source reference (like "Page 12" or "Section 5"), node count.

**Keyboard Navigation:**

Tab key should cycle through nodes in the graph. Arrow keys could navigate to connected nodes. Escape should deselect and return focus to a neutral state. These are nice-to-have for MVP.

---

## 5. Component Implementation Details

### Retro UI Primitives

Create a set of reusable retro-styled components in `src/components/retro/`.

**Window:** A container with the 3D beveled border, gray background, and drop shadow. Does not include title bar (that's separate).

**TitleBar:** Blue gradient background (#000080 to #1084d0 left to right), white text, contains title and window control buttons.

**Button:** Gray background with 3D beveled border. When pressed, the border colors invert to create a "pressed" effect. When active/selected, use blue background with white text.

**Inset:** A container with inverted 3D border (dark on top/left, light on bottom/right) to create a recessed appearance. Used for text areas, lists, content wells.

**StatusBar:** Gray background with top border, contains multiple segments each with inset styling.

**Tree:** A hierarchical list with expand/collapse functionality, indentation for children, and selection highlighting.

**Table:** A data table with sortable column headers, row selection, and alternating row colors.

### Graph Components

Located in `src/components/graph/`.

**GraphCanvas:** Wrapper around React Flow. Handles loading node/edge data, applying Dagre layout, and managing selection state. Renders CustomNode and CustomEdge components.

**CustomNode:** The retro-styled node component. Receives node data and isActive boolean. Renders the type symbol, label, and applies appropriate styling. Has hover and active states with transitions.

**CustomEdge:** Custom edge rendering that changes appearance based on whether either connected node is active. Active edges should be solid lines with amber color. Inactive edges should be dashed gray lines.

### Source Components

Located in `src/components/source/`.

**SourcePanel:** Container that switches between PDFViewer and FormattedViewer based on viewMode state.

**ViewModeToggle:** Two-button toggle for switching between PDF and Formatted modes.

**PDFViewer:** Wraps react-pdf Document and Page components. Manages scroll container ref for sync detection. Renders HighlightOverlay when a node is active.

**HighlightOverlay:** Absolutely positioned div that renders the highlight rectangle over the PDF. Calculates pixel position from normalized boundingBox coordinates based on current page dimensions.

**FormattedViewer:** Renders the ExtractedContent sections as styled blocks. Manages scroll container ref for sync detection.

**ContentSection:** Individual section block component. Shows content text, type styling, and node indicator when applicable. Has active state styling.

### Dashboard Components

Located in `src/components/dashboard/`.

**FolderTree:** Renders the hierarchical folder structure. Handles expand/collapse state, selection, and the "All Items" virtual folder.

**EntityList:** Table component showing entities. Handles selection, sorting, and emits events for row actions.

**EntityRow:** Individual row in the entity table.

---

## 6. Hooks

Located in `src/hooks/`.

**useEntity(id: string):** Fetches a single Knowledge Entity by ID. Returns the entity data and loading state.

**useEntities():** Fetches all Knowledge Entities. Returns the list and loading state.

**useFolders():** Fetches all folders. Returns the list, loading state, and mutation functions for create/update/delete.

**useTwoWaySync(nodes, sections, pdfAnchors):** Manages the two-way synchronization logic. Returns activeNodeId, syncSource, a function to select a node from the graph, and a scroll handler function for the source panel.

**useViewMode():** Manages the PDF/Formatted view mode toggle. Persists preference to localStorage.

**useLocalStorage(key, defaultValue):** Generic hook for persisting state to localStorage.

---

## 7. File Structure

```
src/
├── main.tsx
├── App.tsx
├── router.tsx
├── pages/
│   ├── Dashboard.tsx
│   └── EntityViewer.tsx
├── components/
│   ├── retro/
│   │   ├── Window.tsx
│   │   ├── TitleBar.tsx
│   │   ├── Button.tsx
│   │   ├── Inset.tsx
│   │   ├── StatusBar.tsx
│   │   ├── Tree.tsx
│   │   └── Table.tsx
│   ├── dashboard/
│   │   ├── FolderTree.tsx
│   │   ├── EntityList.tsx
│   │   └── EntityRow.tsx
│   ├── graph/
│   │   ├── GraphCanvas.tsx
│   │   ├── CustomNode.tsx
│   │   └── CustomEdge.tsx
│   ├── source/
│   │   ├── SourcePanel.tsx
│   │   ├── ViewModeToggle.tsx
│   │   ├── PDFViewer.tsx
│   │   ├── HighlightOverlay.tsx
│   │   ├── FormattedViewer.tsx
│   │   └── ContentSection.tsx
│   └── layout/
│       ├── SplitView.tsx
│       └── ResizeHandle.tsx
├── hooks/
│   ├── useEntity.ts
│   ├── useEntities.ts
│   ├── useFolders.ts
│   ├── useTwoWaySync.ts
│   ├── useViewMode.ts
│   └── useLocalStorage.ts
├── types/
│   ├── entity.ts
│   ├── graph.ts
│   ├── content.ts
│   └── folder.ts
├── styles/
│   └── retro.ts
├── mocks/
│   ├── handlers.ts
│   ├── browser.ts
│   └── data/
│       ├── entities.json
│       ├── folders.json
│       └── sample-entity.json
└── utils/
    ├── layout.ts
    └── geometry.ts
```

---

## 8. Mock Data

For development, create mock data that MSW will serve.

**entities.json** contains an array of Knowledge Entity objects (can omit the full graph and content, just include metadata and stats).

**folders.json** contains an array of Folder objects representing the folder hierarchy.

**sample-entity.json** contains one complete Knowledge Entity with full graph data and extracted content. This is what gets returned when fetching a specific entity by ID.

Create mock handlers in **handlers.ts** that intercept fetch requests and return the appropriate mock data:

- GET /api/entities returns entities.json
- GET /api/entities/:id returns sample-entity.json (ignoring the actual ID for MVP)
- GET /api/folders returns folders.json
- POST/PATCH/DELETE handlers can just return success responses

---

## 9. Design Tokens

Located in `src/styles/retro.ts`:

```typescript
export const retro = {
  colors: {
    black: '#1a1a1a',
    white: '#f5f5f0',
    cream: '#fffef9',
    gray: '#c0c0c0',
    darkGray: '#808080',
    blue: '#000080',
    lightBlue: '#1084d0',
    green: '#227722',
    amber: '#c9a227',
    red: '#aa2222',
    windowBg: '#ececec',
    desktop: '#008080',
    highlight: '#ffe066',
  },
  borders: {
    outset: {
      borderTop: '2px solid #ffffff',
      borderLeft: '2px solid #ffffff',
      borderBottom: '2px solid #808080',
      borderRight: '2px solid #808080',
    },
    inset: {
      borderTop: '2px solid #808080',
      borderLeft: '2px solid #808080',
      borderBottom: '2px solid #ffffff',
      borderRight: '2px solid #ffffff',
    },
  },
  fonts: {
    mono: '"IBM Plex Mono", "Courier New", monospace',
    serif: 'Georgia, serif',
  },
};
```

---

## 10. Implementation Order

**Phase 1:** Set up project with Vite, React, TypeScript. Install dependencies. Create retro design tokens and primitive components (Window, TitleBar, Button, Inset, StatusBar). Verify styling looks correct with a test page.

**Phase 2:** Build Dashboard page. Create FolderTree and EntityList components. Set up MSW with mock data. Implement folder selection filtering. Implement navigation to entity viewer (even if that page is empty).

**Phase 3:** Build Entity Viewer page structure. Create GraphCanvas with React Flow and Dagre layout. Create CustomNode component with retro styling. Verify graph renders correctly with mock data.

**Phase 4:** Build FormattedViewer (this is simpler than PDF and lets us test sync logic). Create ContentSection component. Implement two-way sync between graph and formatted view.

**Phase 5:** Build PDFViewer with react-pdf. Create HighlightOverlay component. Implement two-way sync between graph and PDF view. Add ViewModeToggle to switch between modes.

**Phase 6:** Polish and edge cases. Add edge highlighting. Add keyboard navigation. Handle loading and error states. Optimize performance with memoization.

---

## 11. Key Implementation Notes

**React Flow Setup:** When using React Flow, you need to wrap your flow component in a ReactFlowProvider. The flow component itself should be wrapped in a div with explicit width and height (100% of parent). Use the `fitView` prop to automatically fit the graph in view on load.

**Dagre Layout:** After loading nodes and edges, run them through Dagre to get positions. Create a new dagre Graph, set graph options with `rankdir: 'LR'` for left-to-right layout. Add nodes with width/height estimates (around 150x50 pixels works for the node design). Add edges. Call `dagre.layout(graph)`. Then map over your nodes and add the calculated x,y positions.

**react-pdf Setup:** You need to configure the PDF.js worker. Set `pdfjs.GlobalWorkerOptions.workerSrc` to a CDN URL for the worker script. Render Document component with file prop pointing to PDF URL. Inside Document, render Page components for each page. Use the `onLoadSuccess` callback to get page count.

**Scroll Detection:** For detecting which content is in view, use an IntersectionObserver or calculate based on scroll position and element offsets. Find the element whose center is closest to the container's vertical center. Debounce or throttle this calculation for performance.

**Preventing Sync Loops:** Use a ref (not state) to track when programmatic scrolling is happening. Set it to true before triggering a scroll, set it back to false after a timeout. Check this ref in the scroll handler and skip sync logic if it's true.

---

## 12. Success Criteria

The MVP is complete when:

1. Dashboard shows a list of entities organized by folders
2. Clicking folders filters the entity list
3. Double-clicking an entity opens the Entity Viewer
4. Entity Viewer shows graph on left, source on right
5. Graph nodes are positioned automatically and styled in retro aesthetic
6. Clicking a node in the graph scrolls and highlights the source content
7. Scrolling through source content highlights the corresponding node in the graph
8. Toggle between PDF and Formatted view modes works
9. Active node and connected edges are visually distinct
10. Split view can be resized by dragging the divider
11. Application works without console errors in Chrome

---

**End of Implementation Guide**