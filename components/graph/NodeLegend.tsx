/**
 * NodeLegend Component
 *
 * Displays legend explaining node type colors and node state indicators.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { NODE_TYPE_COLORS, NODE_STATE_COLORS } from '@/lib/mermaid-theme';

/**
 * Props for NodeLegend component
 */
export interface NodeLegendProps {
  /** Custom CSS class name */
  className?: string;

  /** Initially expanded (default false) */
  initiallyExpanded?: boolean;

  /** Show node types section (default true) */
  showNodeTypes?: boolean;

  /** Show node states section (default true) */
  showNodeStates?: boolean;

  /** Show edge types section (default false, can be added later) */
  showEdgeTypes?: boolean;
}

/**
 * Legend item component
 */
interface LegendItemProps {
  color: string;
  label: string;
  description?: string;
  borderColor?: string;
  isBorderOnly?: boolean;
}

function LegendItem({
  color,
  label,
  description,
  borderColor,
  isBorderOnly = false,
}: LegendItemProps) {
  return (
    <div className="flex items-start gap-2">
      <div
        className="w-5 h-5 rounded flex-shrink-0 mt-0.5"
        style={{
          backgroundColor: isBorderOnly ? 'transparent' : color,
          border: `2px solid ${borderColor || color}`,
        }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        {description && (
          <div className="text-xs text-text-secondary mt-0.5">{description}</div>
        )}
      </div>
    </div>
  );
}

/**
 * NodeLegend - Graph color legend component
 *
 * Shows meaning of colors used in the graph:
 * - Node types (root, supporting, example, definition, question)
 * - Node states (has notes, mastered, needs review)
 *
 * Can be collapsed/expanded. Positioned in top-right corner of graph.
 *
 * @example
 * ```tsx
 * <NodeLegend
 *   initiallyExpanded={true}
 *   showNodeTypes={true}
 *   showNodeStates={true}
 * />
 * ```
 */
export function NodeLegend({
  className = '',
  initiallyExpanded = false,
  showNodeTypes = true,
  showNodeStates = true,
  showEdgeTypes = false,
}: NodeLegendProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  return (
    <div
      className={`absolute top-6 right-6 bg-chrome rounded-lg shadow-lg border border-primary-100 ${className}`}
      role="complementary"
      aria-label="Graph legend"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary-50 transition-colors rounded-t-lg"
        aria-expanded={isExpanded}
        aria-controls="legend-content"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-700" />
          <span className="text-sm font-semibold text-text-primary">
            Graph Legend
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div id="legend-content" className="px-4 pb-4 space-y-4">
          {/* Node Types */}
          {showNodeTypes && (
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">
                Node Types
              </div>
              <div className="space-y-2">
                <LegendItem
                  color={NODE_TYPE_COLORS.root}
                  label="Root Concept"
                  description="Foundation concepts"
                />
                <LegendItem
                  color={NODE_TYPE_COLORS.supporting}
                  label="Supporting Concept"
                  description="Secondary ideas"
                />
                <LegendItem
                  color={NODE_TYPE_COLORS.example}
                  label="Example"
                  description="Practical applications"
                />
                <LegendItem
                  color={NODE_TYPE_COLORS.definition}
                  label="Definition"
                  description="Terminology nodes"
                />
                <LegendItem
                  color={NODE_TYPE_COLORS.question}
                  label="Question"
                  description="Areas to explore"
                />
              </div>
            </div>
          )}

          {/* Node States */}
          {showNodeStates && (
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">
                Node States
              </div>
              <div className="space-y-2">
                <LegendItem
                  color="#FFFFFF"
                  borderColor={NODE_STATE_COLORS.withNotes}
                  label="Has Notes"
                  description="You've added notes"
                  isBorderOnly={true}
                />
                <LegendItem
                  color={NODE_STATE_COLORS.mastered}
                  label="Mastered"
                  description="Confirmed understanding"
                />
                <LegendItem
                  color={NODE_STATE_COLORS.needsReview}
                  label="Needs Review"
                  description="Requires attention"
                />
              </div>
            </div>
          )}

          {/* Edge Types (optional, for future) */}
          {showEdgeTypes && (
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">
                Connections
              </div>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-primary" />
                  <span>Causal (leads to)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-edge-definitional" />
                  <span>Definitional (is a)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-0.5 bg-edge-example"
                    style={{ backgroundImage: 'repeating-linear-gradient(to right, #00BCD4 0, #00BCD4 4px, transparent 4px, transparent 8px)' }}
                  />
                  <span>Example (such as)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-0.5 bg-edge-contrast"
                    style={{ backgroundImage: 'repeating-linear-gradient(to right, #FF9800 0, #FF9800 2px, transparent 2px, transparent 4px)' }}
                  />
                  <span>Contrasts with</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-edge-related" />
                  <span>Related to</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Guide */}
          <div className="pt-2 border-t border-primary-100">
            <div className="text-xs text-text-secondary space-y-1">
              <div className="flex items-start gap-1.5">
                <span className="text-primary-700 font-medium">•</span>
                <span>Click nodes to read content</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-primary-700 font-medium">•</span>
                <span>Hover to highlight connections</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-primary-700 font-medium">•</span>
                <span>Use controls to zoom and pan</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NodeLegend;
