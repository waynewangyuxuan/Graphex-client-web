/**
 * useAutoSave Hook Tests
 *
 * Tests for auto-save hook with debouncing functionality.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const onSave = jest.fn();
    const { result } = renderHook(() =>
      useAutoSave('test content', { onSave })
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBeNull();
    expect(typeof result.current.saveNow).toBe('function');
    expect(typeof result.current.cancelPendingSave).toBe('function');
  });

  it('should debounce save calls', async () => {
    const onSave = jest.fn();
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave, delay: 2000 }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'updated' });

    // Should not save immediately
    expect(onSave).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should save after delay
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('updated');
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  it('should cancel previous save when content changes', async () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave, delay: 2000 }),
      { initialProps: { content: 'initial' } }
    );

    // Change content multiple times
    rerender({ content: 'update 1' });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    rerender({ content: 'update 2' });
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    rerender({ content: 'update 3' });

    // Fast-forward to complete delay
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should only save the last value
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('update 3');
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  it('should not save if content is below minimum length', async () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ content }) =>
        useAutoSave(content, { onSave, delay: 2000, minLength: 5 }),
      { initialProps: { content: '' } }
    );

    // Set content below minimum
    rerender({ content: 'abc' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onSave).not.toHaveBeenCalled();

    // Set content above minimum
    rerender({ content: 'abcdef' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('abcdef');
    });
  });

  it('should not save if content has not changed', async () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave, delay: 2000 }),
      { initialProps: { content: 'initial' } }
    );

    // Change content and save
    rerender({ content: 'updated' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('updated');
    });

    onSave.mockClear();

    // Rerender with same content
    rerender({ content: 'updated' });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should not save again since content hasn't changed
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should support manual save with saveNow', async () => {
    const onSave = jest.fn();
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave, delay: 2000 }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'test content' });

    // Trigger manual save
    act(() => {
      result.current.saveNow();
    });

    // Should save immediately without waiting for debounce
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('test content');
    });
  });

  it('should cancel pending save', async () => {
    const onSave = jest.fn();
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave, delay: 2000 }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'updated' });

    // Cancel before save triggers
    act(() => {
      jest.advanceTimersByTime(1000);
      result.current.cancelPendingSave();
      jest.advanceTimersByTime(2000);
    });

    // Should not save
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should not save when disabled', async () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ content, enabled }) =>
        useAutoSave(content, { onSave, delay: 2000, enabled }),
      { initialProps: { content: 'initial', enabled: false } }
    );

    // Change content while disabled
    rerender({ content: 'updated', enabled: false });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should not save
    expect(onSave).not.toHaveBeenCalled();

    // Enable and change again
    rerender({ content: 'updated again', enabled: true });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should save now
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('updated again');
    });
  });

  it('should update lastSaved timestamp after successful save', async () => {
    const onSave = jest.fn();
    const { result, rerender } = renderHook(
      ({ content }) => useAutoSave(content, { onSave, delay: 2000 }),
      { initialProps: { content: 'initial' } }
    );

    expect(result.current.lastSaved).toBeNull();

    // Change content
    rerender({ content: 'test content' });

    act(() => {
      result.current.saveNow();
    });

    await waitFor(() => {
      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });
  });

  it('should cleanup on unmount', () => {
    const onSave = jest.fn();
    const { unmount } = renderHook(() =>
      useAutoSave('test content', { onSave, delay: 2000 })
    );

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should not save after unmount
    expect(onSave).not.toHaveBeenCalled();
  });
});
