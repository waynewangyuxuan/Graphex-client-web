# TODO TRACKER
This tracker serves as a log of what we need to do in the next iteration of development. sections are separated by time(date granularity). APPEND ONLY.

---

## 2025-12-01

### Restyle: Retro → Paper Canvas

Major design system overhaul. Moving from Windows 3.1 retro aesthetic to warm "Paper Canvas" design.

**Phase 1: Setup & Dashboard** ✅ COMPLETE
- [x] Install Tailwind CSS and configure custom theme (sand/terra/accent colors)
- [x] Add Google Fonts (Inter, Lora)
- [x] Create index.css with Tailwind directives and paper texture utilities
- [x] Rewrite Dashboard.tsx with new Paper Canvas styling
- [x] Create new layout components (Header)
- [x] Integrate folder/entity display into Dashboard
- [x] Add stats cards row to Dashboard
- [x] Remove old retro components
- [x] Restyle EntityViewer shell with Paper Canvas

---

## Remaining Frontend Work

### Dashboard Enhancements
- [x] Search functionality (filter entities by title/tags)
- [x] Sorting (wire up sort dropdown to actually sort entities)
- [x] Create entity modal (button exists, needs modal UI)
- [x] Create folder modal (button exists, needs modal UI)
- [x] Multi-select entities (checkbox column, bulk actions)
- [x] Context menu on entity row (rename, delete, move)
- [ ] Drag-and-drop entities to folders
- [x] Pagination (if entity count grows large)

### EntityViewer - Graph Panel
- [ ] GraphCanvas component with React Flow
- [ ] Dagre layout for automatic node positioning
- [ ] CustomNode component (Paper Canvas styled)
- [ ] CustomEdge component with highlighting
- [ ] Node selection state
- [ ] Edge highlighting when node is active
- [ ] Pan and zoom controls

### EntityViewer - Source Panel
- [ ] SourcePanel container with view mode switching
- [ ] ViewModeToggle component (PDF / Formatted)
- [ ] PDFViewer with react-pdf
- [ ] HighlightOverlay for bounding box display
- [ ] FormattedViewer for extracted content
- [ ] ContentSection component with node indicators

### EntityViewer - Two-Way Sync
- [ ] useTwoWaySync hook
- [ ] Graph → Source sync (click node, scroll to content)
- [ ] Source → Graph sync (scroll content, highlight node)
- [ ] Sync loop prevention (debounce/ref guard)
- [ ] Sync indicator in toolbar

### EntityViewer - Layout
- [ ] SplitView component
- [ ] ResizeHandle for draggable divider
- [ ] Persist split ratio to localStorage

### Hooks
- [ ] useEntity(id) - fetch single entity with full graph/content
- [ ] useViewMode - toggle and persist PDF/Formatted preference

### Data & API
- [ ] Mock data for sample-entity.json with full graph/content
- [ ] MSW handler for GET /api/entities/:id
- [ ] Verify entity data matches TypeScript interfaces

### Polish
- [ ] Keyboard navigation (Tab through nodes, Escape to deselect)
- [ ] Loading states (skeleton loaders)
- [ ] Empty states (no entities, no search results)
- [ ] Error states (API failures)
- [ ] Responsive layout adjustments
