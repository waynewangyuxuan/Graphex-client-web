/**
 * Mermaid.js Theme Configuration
 *
 * Custom theme configuration for Mermaid graphs that matches our
 * colorful design system. Provides vibrant, clear colors for nodes
 * and edges based on functional color system from UIUX.md.
 */

import type { MermaidConfig } from 'mermaid';

/**
 * Node type to color mapping
 * Based on the functional color system from tailwind.config.ts
 */
export const NODE_TYPE_COLORS = {
  root: '#1565C0', // Deep blue - foundation concepts
  supporting: '#42A5F5', // Medium blue - secondary ideas
  example: '#4DD0E1', // Light cyan - practical implementations
  definition: '#7E57C2', // Purple - terminology nodes
  question: '#FF9800', // Orange - areas needing exploration
  default: '#42A5F5', // Medium blue - default for unknown types
} as const;

/**
 * Node state colors (overlays on type colors)
 */
export const NODE_STATE_COLORS = {
  withNotes: '#FFC107', // Gold border - user has notes
  mastered: '#66BB6A', // Green background - confirmed understanding
  needsReview: '#FF7043', // Red-orange background - requires attention
} as const;

/**
 * Edge/relationship type colors
 */
export const EDGE_TYPE_COLORS = {
  causal: '#2196F3', // Blue - "leads to", "causes"
  definitional: '#9C27B0', // Purple - "is a", "defines"
  example: '#00BCD4', // Cyan - "such as"
  contrast: '#FF9800', // Orange - "contrasts with"
  related: '#90A4AE', // Gray - general relationship
  default: '#90A4AE', // Gray - default for unknown types
} as const;

/**
 * Edge style configurations
 */
export const EDGE_STYLES = {
  causal: {
    stroke: EDGE_TYPE_COLORS.causal,
    strokeWidth: 3,
    strokeDasharray: 'none',
  },
  definitional: {
    stroke: EDGE_TYPE_COLORS.definitional,
    strokeWidth: 2,
    strokeDasharray: 'none',
  },
  example: {
    stroke: EDGE_TYPE_COLORS.example,
    strokeWidth: 2,
    strokeDasharray: '5,5',
  },
  contrast: {
    stroke: EDGE_TYPE_COLORS.contrast,
    strokeWidth: 2,
    strokeDasharray: '2,2',
  },
  related: {
    stroke: EDGE_TYPE_COLORS.related,
    strokeWidth: 2,
    strokeDasharray: 'none',
  },
} as const;

/**
 * Get Mermaid theme configuration
 *
 * Returns a complete Mermaid config object with our custom theme.
 * Uses 'base' theme as foundation and overrides colors to match
 * our vibrant knowledge canvas design.
 *
 * @param options - Optional theme customization
 * @returns Complete Mermaid configuration object
 *
 * @example
 * ```typescript
 * import mermaid from 'mermaid';
 * import { getMermaidTheme } from '@/lib/mermaid-theme';
 *
 * mermaid.initialize(getMermaidTheme());
 * ```
 */
export function getMermaidTheme(options?: {
  fontFamily?: string;
  fontSize?: string;
}): MermaidConfig {
  const fontFamily = options?.fontFamily || 'Inter, sans-serif';
  const fontSize = options?.fontSize || '14px';

  return {
    startOnLoad: false, // We'll manually trigger rendering
    theme: 'base',
    themeVariables: {
      // Primary colors (default node styling)
      primaryColor: NODE_TYPE_COLORS.supporting, // Medium blue
      primaryTextColor: '#FFFFFF',
      primaryBorderColor: NODE_TYPE_COLORS.root, // Deep blue border

      // Secondary colors (for alternate node types)
      secondaryColor: NODE_TYPE_COLORS.example,
      secondaryTextColor: '#1A3A52',
      secondaryBorderColor: '#00BCD4',

      // Tertiary colors
      tertiaryColor: NODE_TYPE_COLORS.definition,
      tertiaryTextColor: '#FFFFFF',
      tertiaryBorderColor: '#7E57C2',

      // Edge/line colors
      lineColor: EDGE_TYPE_COLORS.related, // Gray for default edges

      // Background
      background: '#F0F8FC', // Canvas color

      // Text
      fontFamily,
      fontSize,

      // Node styling
      nodeBorder: '2px',
      nodeTextColor: '#FFFFFF',

      // Edge styling
      edgeLabelBackground: '#FFFFFF',

      // Class diagram specific (if using class diagrams)
      classText: '#1A3A52',
    },

    // Flowchart specific configuration
    flowchart: {
      htmlLabels: true,
      curve: 'basis', // Smooth curves for edges
      padding: 20,
      nodeSpacing: 60, // Space between nodes horizontally
      rankSpacing: 80, // Space between nodes vertically
      diagramPadding: 24, // Padding around entire diagram
      useMaxWidth: true, // Responsive width
    },

    // Security
    securityLevel: 'strict', // Prevent XSS attacks

    // Layout direction
    flowchart: {
      ...({} as any),
      defaultRenderer: 'dagre', // Use dagre for better layout
    },
  };
}

/**
 * Get CSS class name for node type
 *
 * Maps node type to CSS class for additional styling
 *
 * @param nodeType - Type of the node
 * @returns CSS class name
 */
export function getNodeTypeClass(
  nodeType: 'root' | 'supporting' | 'example' | 'definition' | 'question' | string
): string {
  const typeMap: Record<string, string> = {
    root: 'node-root',
    supporting: 'node-supporting',
    example: 'node-example',
    definition: 'node-definition',
    question: 'node-question',
  };

  return typeMap[nodeType] || 'node-default';
}

/**
 * Get CSS class name for edge type
 *
 * @param edgeType - Type of the edge relationship
 * @returns CSS class name
 */
export function getEdgeTypeClass(
  edgeType: 'causal' | 'definitional' | 'example' | 'contrast' | 'related' | string
): string {
  const typeMap: Record<string, string> = {
    causal: 'edge-causal',
    definitional: 'edge-definitional',
    example: 'edge-example',
    contrast: 'edge-contrast',
    related: 'edge-related',
  };

  return typeMap[edgeType] || 'edge-default';
}

/**
 * Generate Mermaid-compatible style classes string
 *
 * Generates the classDef and class statements for Mermaid to apply
 * our custom colors to nodes and edges.
 *
 * @returns Mermaid style definitions as string
 *
 * @example
 * ```typescript
 * const mermaidCode = `
 *   graph TD
 *     A[Root Concept]
 *     B[Supporting Concept]
 *     A --> B
 *   ${getMermaidStyleDefinitions()}
 * `;
 * ```
 */
export function getMermaidStyleDefinitions(): string {
  return `
    classDef nodeRoot fill:${NODE_TYPE_COLORS.root},stroke:${NODE_TYPE_COLORS.root},color:#fff,stroke-width:2px;
    classDef nodeSupporting fill:${NODE_TYPE_COLORS.supporting},stroke:${NODE_TYPE_COLORS.supporting},color:#fff,stroke-width:2px;
    classDef nodeExample fill:${NODE_TYPE_COLORS.example},stroke:${NODE_TYPE_COLORS.example},color:#1A3A52,stroke-width:2px;
    classDef nodeDefinition fill:${NODE_TYPE_COLORS.definition},stroke:${NODE_TYPE_COLORS.definition},color:#fff,stroke-width:2px;
    classDef nodeQuestion fill:${NODE_TYPE_COLORS.question},stroke:${NODE_TYPE_COLORS.question},color:#fff,stroke-width:2px;

    classDef nodeWithNotes stroke:${NODE_STATE_COLORS.withNotes},stroke-width:3px;
    classDef nodeMastered fill:${NODE_STATE_COLORS.mastered},stroke:${NODE_STATE_COLORS.mastered},color:#fff;
    classDef nodeNeedsReview fill:${NODE_STATE_COLORS.needsReview},stroke:${NODE_STATE_COLORS.needsReview},color:#fff;
  `.trim();
}

/**
 * Apply node type styling to Mermaid code
 *
 * Helper function to apply class to a specific node in Mermaid syntax
 *
 * @param nodeKey - Mermaid node key (e.g., "A", "B", "C")
 * @param nodeType - Type of node
 * @returns Mermaid class application statement
 *
 * @example
 * ```typescript
 * applyNodeStyle("A", "root") // Returns: "class A nodeRoot;"
 * ```
 */
export function applyNodeStyle(
  nodeKey: string,
  nodeType: 'root' | 'supporting' | 'example' | 'definition' | 'question'
): string {
  const classMap: Record<string, string> = {
    root: 'nodeRoot',
    supporting: 'nodeSupporting',
    example: 'nodeExample',
    definition: 'nodeDefinition',
    question: 'nodeQuestion',
  };

  const className = classMap[nodeType] || 'nodeSupporting';
  return `class ${nodeKey} ${className};`;
}
