/**
 * SaveStatus Component Tests
 *
 * Tests for auto-save status indicator component.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { SaveStatus } from '@/components/notes/SaveStatus';

describe('SaveStatus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render nothing when idle', () => {
    const { container } = render(
      <SaveStatus isSaving={false} lastSaved={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show saving state', () => {
    render(<SaveStatus isSaving={true} lastSaved={null} />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show saved state after successful save', () => {
    const lastSaved = new Date();
    render(<SaveStatus isSaving={false} lastSaved={lastSaved} />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should hide saved state after 2 seconds', async () => {
    const lastSaved = new Date();
    render(<SaveStatus isSaving={false} lastSaved={lastSaved} />);

    expect(screen.getByText('Saved')).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });
  });

  it('should show error state', () => {
    render(
      <SaveStatus isSaving={false} lastSaved={null} error="Save failed" />
    );

    expect(screen.getByText('Failed to save')).toBeInTheDocument();
  });

  it('should show retry button on error', () => {
    const onRetry = jest.fn();
    render(
      <SaveStatus
        isSaving={false}
        lastSaved={null}
        error="Save failed"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    retryButton.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<SaveStatus isSaving={true} lastSaved={null} />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('should apply custom className', () => {
    render(
      <SaveStatus
        isSaving={true}
        lastSaved={null}
        className="custom-class"
      />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveClass('custom-class');
  });
});
