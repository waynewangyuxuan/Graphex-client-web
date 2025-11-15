import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

/**
 * Loading State for Processing Page
 *
 * Displayed while the processing page component is loading.
 * Provides instant feedback during page transitions.
 */
export default function ProcessingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <Card.Body className="flex flex-col items-center space-y-6 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Spinner size="lg" variant="primary" />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-text-primary">
              Loading...
            </h2>
            <p className="text-sm text-text-secondary">Please wait a moment</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
