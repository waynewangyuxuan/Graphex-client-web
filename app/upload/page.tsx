/**
 * Upload Page
 *
 * Document upload page where users can upload PDF, text, or markdown files
 * to generate knowledge graphs.
 *
 * Route: /upload
 */

import type { Metadata } from 'next';
import { DocumentUploadForm } from '@/components/upload';

export const metadata: Metadata = {
  title: 'Upload Document | Graphex',
  description: 'Upload a document to generate your knowledge graph',
};

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-text-primary">
            Upload Document to Begin
          </h1>
          <p className="text-base text-text-secondary max-w-lg mx-auto">
            Upload a PDF, text, or markdown file to generate your knowledge
            graph and start learning
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-chrome rounded-lg shadow-lg p-8">
          <DocumentUploadForm />
        </div>

        {/* Info Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-8 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Secure Upload</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>AI-Powered</span>
            </div>
          </div>

          {/* Sample Document Link (optional - can be implemented later) */}
          {/* <p className="text-sm text-text-muted">
            Not sure where to start?{' '}
            <a
              href="/sample"
              className="text-primary hover:underline font-medium"
            >
              Try a sample document
            </a>
          </p> */}
        </div>
      </div>
    </div>
  );
}
