/**
 * Loading State for Graph View Page
 *
 * Shown while graph data is being fetched.
 * Provides immediate feedback to the user.
 */

export default function Loading() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header Skeleton */}
      <header className="h-16 bg-chrome border-b border-gray-200 flex items-center px-6">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
      </header>

      {/* Split View Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph Skeleton (60%) */}
        <div className="w-3/5 border-r border-gray-200 bg-canvas">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-text-secondary">Loading graph...</p>
            </div>
          </div>
        </div>

        {/* Reading Panel Skeleton (40%) */}
        <div className="w-2/5 bg-chrome">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-text-secondary">Loading document...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
