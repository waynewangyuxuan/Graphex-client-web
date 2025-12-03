import { useState, useEffect, useCallback } from 'react';

export type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

/**
 * Generic hook for handling async operations with loading/error states.
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  dependencies: unknown[] = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = useCallback(() => {
    setState({ status: 'loading', data: null, error: null });

    asyncFn()
      .then((data) => {
        setState({ status: 'success', data, error: null });
      })
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ status: 'error', data: null, error });
      });
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
