import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout';

const ArrowLeftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function EntityViewer() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex flex-col paper-bg">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-sand-200 bg-sand-50/50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-sand-500 hover:text-sand-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Library
              </Link>
              <span className="text-sand-300">|</span>
              <h1 className="text-lg font-medium text-sand-800">
                Entity: {id}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-sand-500">
              <span>Sync: <span className="text-sand-700">Active</span></span>
              <span className="text-sand-300">|</span>
              <span>0 nodes</span>
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Graph Panel */}
          <div className="w-[45%] border-r border-sand-200 flex flex-col">
            <div className="px-4 py-2 border-b border-sand-200 bg-sand-50">
              <h2 className="text-xs font-semibold text-sand-600 uppercase tracking-widest">
                Knowledge Graph
              </h2>
            </div>
            <div className="flex-1 relative bg-sand-50/30">
              {/* Grid background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(#E6D9C630 1px, transparent 1px),
                    linear-gradient(90deg, #E6D9C630 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-sand-400 text-sm">
                Graph canvas will render here
              </div>
            </div>
          </div>

          {/* Source Panel */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b border-sand-200 bg-sand-50">
              <h2 className="text-xs font-semibold text-sand-600 uppercase tracking-widest">
                Source Document
              </h2>
            </div>
            <div className="flex-1 overflow-auto bg-white p-8">
              <div className="max-w-2xl mx-auto text-sand-400 text-sm">
                Source content will render here
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-t border-sand-200 bg-sand-50 px-6 py-2 text-xs text-sand-500">
          <div className="max-w-7xl mx-auto flex items-center gap-6">
            <span>Two-way sync active</span>
            <span className="text-sand-300">|</span>
            <span>Node: —</span>
          </div>
        </div>
      </main>
    </div>
  );
}
