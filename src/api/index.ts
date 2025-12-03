/**
 * Typed API layer for network requests.
 * Uses Zod for runtime validation at network boundaries.
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas (single source of truth for API response validation)
// ============================================================================

const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
});

const EntityStatsSchema = z.object({
  nodeCount: z.number(),
  edgeCount: z.number(),
  pageCount: z.number(),
});

const EntitySummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  folderId: z.string().nullable(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  modifiedAt: z.string(),
  stats: EntityStatsSchema,
});

const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

const NodeSourceSchema = z.object({
  sectionId: z.string(),
  pageNumber: z.number(),
  boundingBox: BoundingBoxSchema,
  text: z.string(),
});

const NodeTypeSchema = z.enum(['concept', 'key', 'entity', 'event']);

const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: NodeTypeSchema,
  source: NodeSourceSchema,
});

const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  relation: z.string(),
});

const SectionTypeSchema = z.enum(['heading', 'paragraph', 'list', 'table', 'image']);

const SectionSchema = z.object({
  id: z.string(),
  type: SectionTypeSchema,
  level: z.number().optional(),
  content: z.string(),
  pageNumber: z.number(),
  nodeId: z.string().nullable(),
});

const ExtractedContentSchema = z.object({
  sections: z.array(SectionSchema),
});

const KnowledgeEntitySchema = z.object({
  id: z.string(),
  title: z.string(),
  folderId: z.string().nullable(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  modifiedAt: z.string(),
  stats: EntityStatsSchema,
  graph: z.object({
    nodes: z.array(GraphNodeSchema),
    edges: z.array(GraphEdgeSchema),
  }),
  source: z.object({
    pdfUrl: z.string(),
    content: ExtractedContentSchema,
  }),
});

// Export inferred types (these match the types in @/types)
export type Folder = z.infer<typeof FolderSchema>;
export type EntitySummary = z.infer<typeof EntitySummarySchema>;
export type KnowledgeEntity = z.infer<typeof KnowledgeEntitySchema>;

// ============================================================================
// API Error
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Fetch Helpers
// ============================================================================

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${url}`,
      response.status,
      response.statusText
    );
  }

  return response.json() as Promise<unknown>;
}

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`Validation failed for ${context}:`, result.error.issues);
    throw new ApiError(
      `Invalid ${context} data: ${result.error.issues[0]?.message ?? 'unknown error'}`,
      500,
      'Parse Error'
    );
  }
  return result.data;
}

// ============================================================================
// API Functions
// ============================================================================

export async function fetchFolders(): Promise<Folder[]> {
  const data = await fetchJson('/api/folders');
  return parseWithSchema(z.array(FolderSchema), data, 'folders');
}

export async function fetchEntities(): Promise<EntitySummary[]> {
  const data = await fetchJson('/api/entities');
  return parseWithSchema(z.array(EntitySummarySchema), data, 'entities');
}

export async function fetchEntity(id: string): Promise<KnowledgeEntity> {
  const data = await fetchJson(`/api/entities/${id}`);
  return parseWithSchema(KnowledgeEntitySchema, data, 'entity');
}
