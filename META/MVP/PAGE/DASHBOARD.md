# Graphex Frontend: Dashboard Page

## Purpose

Library view showing all Knowledge Entities organized into folders. Entry point of the application.

## Layout

Full viewport window with title bar "GRAPHEX.EXE — Library". Below title bar is a menu bar (File, Edit, View, Help — non-functional placeholders).

Main content splits into two columns: folder tree on left (180px fixed width), entity list on right (remaining space).

Status bar at bottom showing entity count and total nodes.

## Folder Tree (Left Column)

Section header "═ FOLDERS ═" at top.

Tree structure below. First item is "All Items" — a virtual folder that shows all entities when selected. Below are actual folders from the data.

Each folder row shows: expand/collapse indicator (▶ or ▼), folder name. Clicking toggles expand state. Child folders indent under parents.

Track selectedFolderId in state. Clicking a folder updates this. Highlight the selected folder row.

Button at bottom: "+ New Folder". Clicking prompts for name (browser prompt is fine) and creates folder.

## Entity List (Right Column)

Section header "═ KNOWLEDGE ENTITIES ═" with "+ New" button aligned right.

Table with columns: checkbox, Name, Nodes (count), Modified (relative time). Rows alternate background color slightly.

Filter rows based on selectedFolderId. If "All Items" is selected, show all entities. Otherwise show entities where folderId matches selected folder or its descendants.

Single click selects a row. Double click navigates to `/entity/{id}`.

When rows are selected, show action buttons below table: Open, Move to..., Delete.

## State

- `folders`: Folder[] — fetched from API
- `entities`: KnowledgeEntity[] — fetched from API (metadata only, not full graph)
- `selectedFolderId`: string | null — currently selected folder
- `selectedEntityIds`: string[] — multi-select for batch operations
- `expandedFolderIds`: string[] — which folders are expanded in tree

## Navigation

Double-clicking entity row calls `navigate(\`/entity/${entityId}\`)` using React Router's useNavigate hook.