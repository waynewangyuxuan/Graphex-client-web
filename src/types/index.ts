// Node types for the knowledge graph
export type NodeType = 'concept' | 'key' | 'entity' | 'event';

export interface BoundingBox {
  x: number;      // 0-1 normalized
  y: number;      // 0-1 normalized
  width: number;  // 0-1 normalized
  height: number; // 0-1 normalized
}

export interface NodeSource {
  sectionId: string;
  pageNumber: number;
  boundingBox: BoundingBox;
  text: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  source: NodeSource;
}

export interface GraphEdge {
  id: string;
  source: string;  // Node ID
  target: string;  // Node ID
  relation: string;
}

// Section types for extracted content
export type SectionType = 'heading' | 'paragraph' | 'list' | 'table' | 'image';

export interface Section {
  id: string;
  type: SectionType;
  level?: number;        // For headings: 1, 2, 3
  content: string;
  pageNumber: number;
  nodeId: string | null; // Links to graph node
}

export interface ExtractedContent {
  sections: Section[];
}

export interface EntityStats {
  nodeCount: number;
  edgeCount: number;
  pageCount: number;
}

export interface KnowledgeEntity {
  id: string;
  title: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  modifiedAt: string;
  stats: EntityStats;
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  source: {
    pdfUrl: string;
    content: ExtractedContent;
  };
}

// Lightweight entity for list views
export interface EntitySummary {
  id: string;
  title: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  modifiedAt: string;
  stats: EntityStats;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

// Combined type for displaying both folders and entities in file navigator
export type FileItem =
  | { type: 'folder'; id: string; name: string; data: Folder }
  | { type: 'entity'; id: string; name: string; data: EntitySummary };
