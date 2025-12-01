# Graphex Frontend: Source Viewer

## Purpose

Displays the source document alongside the graph. Supports two view modes and two-way synchronization with the graph.

## View Modes

**PDF Mode:** Renders the original PDF file. Highlights are bounding box overlays.

**Formatted Mode:** Renders extracted content as styled HTML sections. Highlights are CSS styling on the active section.

Toggle between modes with ViewModeToggle component. Store current mode in state, persist to localStorage.

## SourcePanel Component

Wrapper that renders either PDFViewer or FormattedViewer based on viewMode state. Both viewers receive the same props: activeNodeId, onScrollToNode callback, and content data.

## PDFViewer Component

Uses react-pdf. Configure the PDF.js worker by setting `pdfjs.GlobalWorkerOptions.workerSrc` to a CDN URL.

Render Document component with the PDF URL. On load success, get page count. Render all pages in a scrollable container.

When activeNodeId changes (and change came from graph), scroll to the corresponding page position. Find the node's pageNumber and boundingBox. Scroll the container so that page is in view, then the bounding box area is visible.

Render HighlightOverlay component when a node is active. This is an absolutely positioned div over the PDF page. Calculate pixel position by multiplying normalized boundingBox values by actual page dimensions. Style with amber border and semi-transparent amber background.

## FormattedViewer Component

Renders sections from ExtractedContent as a vertical list of ContentSection components.

Each section is a block with: type-based styling (headings are larger), the content text, and a node indicator if nodeId is not null.

When activeNodeId changes (from graph), find the section where nodeId matches and scroll it into view.

Active section styling: amber left border (4px solid), light amber background, the node indicator is highlighted.

## ContentSection Component

Renders one section. Props: section data, isActive boolean.

For headings: render as h1/h2/h3 based on level, bold monospace.

For paragraphs: render as div with serif font, 14px, good line height.

Node indicator: small badge on right side showing type symbol (★○●⚠) and can be clicked to select that node.

## Two-Way Sync Logic

This is critical. Sync must work in both directions without causing infinite loops.

**Graph → Source:**
When user clicks a node in the graph, activeNodeId updates. The source viewer detects this change (useEffect on activeNodeId) and scrolls to the corresponding content. Set a ref flag `isScrollingProgrammatically = true` before scrolling. After 500ms, set it back to false.

**Source → Graph:**
Attach a scroll listener to the source container. On scroll, if `isScrollingProgrammatically` is true, do nothing. Otherwise, determine which content is currently in view (the section or PDF anchor closest to vertical center of container). If its nodeId differs from current activeNodeId, update activeNodeId.

**State management:**
The parent EntityViewer component owns activeNodeId state. It passes the value and setter down to both GraphCanvas and SourcePanel. When either side triggers a change, it updates the shared state, and the other side reacts.

**Sync indicator:**
Track which side triggered the last sync. Display in toolbar: "Graph → Source" or "Source → Graph". This helps users understand the behavior.

## useTwoWaySync Hook

Encapsulates sync logic. Returns:
- `activeNodeId`: current active node
- `setActiveNodeFromGraph(nodeId)`: call when graph node is clicked
- `handleSourceScroll(visibleNodeId)`: call from source scroll handler
- `isScrollingRef`: ref to check in scroll handler

Internally manages the programmatic scroll flag and debouncing.