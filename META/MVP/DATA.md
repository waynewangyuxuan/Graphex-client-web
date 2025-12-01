# Graphex Frontend: Data Schemas

## Core Concept

A Knowledge Entity is a graph-document pair. It contains a knowledge graph (nodes and edges) linked to source content (original PDF and extracted text sections).

## Knowledge Entity

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

## Node

Each node represents a concept. The source field links it to a location in the document for two-way sync.

```typescript
interface Node {
  id: string;
  label: string;
  type: "concept" | "key" | "entity" | "event";
  source: {
    sectionId: string;
    pageNumber: number;
    boundingBox: {
      x: number;      // 0-1 normalized
      y: number;      // 0-1 normalized
      width: number;  // 0-1 normalized
      height: number; // 0-1 normalized
    };
    text: string;
  };
}
```

The boundingBox uses normalized coordinates (0 to 1) representing percentages of page dimensions. Multiply by actual page pixel size to get overlay position.

## Edge

```typescript
interface Edge {
  id: string;
  source: string;  // Node ID
  target: string;  // Node ID
  relation: string; // e.g., "INCLUDES", "CAUSES"
}
```

## Extracted Content

Powers the Formatted View mode. The document text is broken into sections.

```typescript
interface ExtractedContent {
  sections: Section[];
}

interface Section {
  id: string;
  type: "heading" | "paragraph" | "list" | "table" | "image";
  level?: number;        // For headings: 1, 2, 3
  content: string;
  pageNumber: number;
  nodeId: string | null; // Links to graph node, null if no link
}
```

When a section has a nodeId, clicking that node in the graph should scroll to this section (in Formatted mode).

## Folder

```typescript
interface Folder {
  id: string;
  name: string;
  parentId: string | null;  // null = root level
}
```

Folders form a tree. Entities belong to folders via folderId.