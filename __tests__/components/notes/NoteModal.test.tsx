/**
 * NoteModal Component Tests
 *
 * Integration tests for note modal with auto-save and API mocking.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { NoteModal } from '@/components/notes/NoteModal';
import { TestWrapper } from '@/lib/test-utils';
import type { Note } from '@/types/api.types';

describe('NoteModal', () => {
  const mockGraphId = 'graph_test123';
  const mockNodeId = 'node_test1';
  const mockNodeTitle = 'Test Node';

  const mockNote: Note = {
    id: 'note_test1',
    graphId: mockGraphId,
    nodeId: mockNodeId,
    edgeId: null,
    content: 'Existing note content',
    createdAt: '2025-11-11T10:00:00Z',
    updatedAt: '2025-11-11T10:00:00Z',
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render when open', () => {
    // Mock empty notes response
    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [] });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
          nodeTitle={mockNodeTitle}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Note')).toBeInTheDocument();
    expect(screen.getByText(mockNodeTitle)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [] });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={false}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should load and display existing note', async () => {
    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [mockNote] });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      const textarea = screen.getByRole('textbox', { name: /note content/i });
      expect(textarea).toHaveValue(mockNote.content);
    });

    expect(screen.getByText('Edit Note')).toBeInTheDocument();
  });

  it('should create new note when typing in empty modal', async () => {
    const user = userEvent.setup({ delay: null });

    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [] });
      }),
      http.post(`/api/v1/graphs/${mockGraphId}/notes`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          data: {
            id: 'note_new123',
            graphId: mockGraphId,
            nodeId: mockNodeId,
            edgeId: null,
            content: (body as any).content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    const textarea = await screen.findByRole('textbox', {
      name: /note content/i,
    });
    await user.type(textarea, 'New note content');

    // Fast-forward for auto-save (2 second delay)
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('should update existing note when editing', async () => {
    const user = userEvent.setup({ delay: null });

    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [mockNote] });
      }),
      http.patch(`/api/v1/notes/${mockNote.id}`, async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          data: {
            ...mockNote,
            content: (body as any).content,
            updatedAt: new Date().toISOString(),
          },
        });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    const textarea = await screen.findByRole('textbox', {
      name: /note content/i,
    });
    await user.clear(textarea);
    await user.type(textarea, 'Updated content');

    // Fast-forward for auto-save
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('should show delete confirmation', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [mockNote] });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(screen.getByText('Delete this note?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('should delete note when confirmed', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [mockNote] });
      }),
      http.delete(`/api/v1/notes/${mockNote.id}`, () => {
        return HttpResponse.json({ data: null });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={onClose}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onClose when Done button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [] });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={onClose}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    const doneButton = await screen.findByRole('button', { name: /done/i });
    await user.click(doneButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show error state when save fails', async () => {
    const user = userEvent.setup({ delay: null });

    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [] });
      }),
      http.post(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json(
          { error: { message: 'Save failed' } },
          { status: 500 }
        );
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    const textarea = await screen.findByRole('textbox', {
      name: /note content/i,
    });
    await user.type(textarea, 'New content');

    // Fast-forward for auto-save
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Failed to save')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching notes', () => {
    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, async () => {
        // Delay response to show loading state
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ data: [] });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Loading note...')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', async () => {
    server.use(
      http.get(`/api/v1/graphs/${mockGraphId}/notes`, () => {
        return HttpResponse.json({ data: [] });
      })
    );

    render(
      <TestWrapper>
        <NoteModal
          isOpen={true}
          onClose={() => {}}
          graphId={mockGraphId}
          nodeId={mockNodeId}
          nodeTitle={mockNodeTitle}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const textarea = screen.getByRole('textbox', { name: /note content/i });
    expect(textarea).toHaveAttribute('aria-label', 'Note content');
  });
});
