/**
 * GraphControls Component
 *
 * Zoom, pan, and view controls for the graph visualization.
 */

'use client';

import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { useState } from 'react';

/**
 * Props for GraphControls component
 */
export interface GraphControlsProps {
  /** Callback when zoom in is clicked */
  onZoomIn?: () => void;

  /** Callback when zoom out is clicked */
  onZoomOut?: () => void;

  /** Callback when fit to screen is clicked */
  onFitToScreen?: () => void;

  /** Callback when pan mode is toggled */
  onTogglePan?: (enabled: boolean) => void;

  /** Current zoom level (0.1 to 2.0) */
  zoomLevel?: number;

  /** Whether pan mode is enabled */
  panEnabled?: boolean;

  /** Custom CSS class name */
  className?: string;
}

/**
 * GraphControls - Control panel for graph interactions
 *
 * Provides buttons for:
 * - Zoom in/out
 * - Fit graph to screen
 * - Toggle pan mode
 * - Visual zoom level indicator
 *
 * Positioned in bottom-right corner of graph container.
 *
 * @example
 * ```tsx
 * <GraphControls
 *   onZoomIn={handleZoomIn}
 *   onZoomOut={handleZoomOut}
 *   onFitToScreen={handleFit}
 *   onTogglePan={handlePan}
 *   zoomLevel={1.0}
 * />
 * ```
 */
export function GraphControls({
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onTogglePan,
  zoomLevel = 1.0,
  panEnabled = false,
  className = '',
}: GraphControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const zoomPercentage = Math.round(zoomLevel * 100);
  const canZoomIn = zoomLevel < 2.0;
  const canZoomOut = zoomLevel > 0.1;

  return (
    <div
      className={`absolute bottom-6 right-6 flex flex-col gap-2 ${className}`}
      role="toolbar"
      aria-label="Graph controls"
    >
      {/* Zoom Level Indicator */}
      <div className="bg-chrome px-3 py-1.5 rounded-lg shadow-lg border border-primary-100">
        <div className="text-xs font-medium text-text-secondary">
          {zoomPercentage}%
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bg-chrome rounded-lg shadow-lg border border-primary-100 p-2 flex flex-col gap-1">
        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          disabled={!canZoomIn}
          className={`
            p-2 rounded-md transition-colors
            ${
              canZoomIn
                ? 'hover:bg-primary-50 text-primary-700 hover:text-primary-900'
                : 'text-text-muted cursor-not-allowed'
            }
          `}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          disabled={!canZoomOut}
          className={`
            p-2 rounded-md transition-colors
            ${
              canZoomOut
                ? 'hover:bg-primary-50 text-primary-700 hover:text-primary-900'
                : 'text-text-muted cursor-not-allowed'
            }
          `}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="h-px bg-primary-100 my-1" />

        {/* Fit to Screen */}
        <button
          onClick={onFitToScreen}
          className="p-2 rounded-md hover:bg-primary-50 text-primary-700 hover:text-primary-900 transition-colors"
          aria-label="Fit to screen"
          title="Fit to screen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Pan Mode Toggle */}
        <button
          onClick={() => onTogglePan?.(!panEnabled)}
          className={`
            p-2 rounded-md transition-colors border
            ${
              panEnabled
                ? 'bg-black text-white border-black'
                : 'bg-white text-primary-700 hover:bg-primary-50 hover:text-primary-900 border-primary-100'
            }
          `}
          aria-label={panEnabled ? 'Disable pan mode' : 'Enable pan mode'}
          title={panEnabled ? 'Disable pan mode' : 'Enable pan mode'}
          aria-pressed={panEnabled}
        >
          <Move className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      {isExpanded && (
        <div className="bg-chrome rounded-lg shadow-lg border border-primary-100 p-3 w-48">
          <div className="text-xs font-semibold text-text-primary mb-2">
            Keyboard Shortcuts
          </div>
          <div className="space-y-1.5 text-xs text-text-secondary">
            <div className="flex justify-between">
              <span className="font-mono bg-primary-50 px-1.5 py-0.5 rounded">+</span>
              <span>Zoom in</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono bg-primary-50 px-1.5 py-0.5 rounded">-</span>
              <span>Zoom out</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono bg-primary-50 px-1.5 py-0.5 rounded">0</span>
              <span>Fit to screen</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono bg-primary-50 px-1.5 py-0.5 rounded">Space</span>
              <span>Pan mode</span>
            </div>
          </div>
        </div>
      )}

      {/* Help Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-chrome px-3 py-1.5 rounded-lg shadow-lg border border-primary-100 hover:bg-primary-50 transition-colors"
        aria-label={isExpanded ? 'Hide keyboard shortcuts' : 'Show keyboard shortcuts'}
      >
        <span className="text-xs font-medium text-primary-700">
          {isExpanded ? '✕' : '?'}
        </span>
      </button>
    </div>
  );
}

export default GraphControls;
