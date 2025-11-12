/**
 * NoteContent Component Tests
 *
 * Tests for note content textarea with character counter.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteContent } from '@/components/notes/NoteContent';

describe('NoteContent', () => {
  it('should render textarea with placeholder', () => {
    const onChange = jest.fn();
    render(
      <NoteContent
        value=""
        onChange={onChange}
        placeholder="Test placeholder"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /note content/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Test placeholder');
  });

  it('should display current value', () => {
    const onChange = jest.fn();
    render(<NoteContent value="Test content" onChange={onChange} />);

    const textarea = screen.getByRole('textbox', { name: /note content/i });
    expect(textarea).toHaveValue('Test content');
  });

  it('should call onChange when typing', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<NoteContent value="" onChange={onChange} />);

    const textarea = screen.getByRole('textbox', { name: /note content/i });
    await user.type(textarea, 'New text');

    expect(onChange).toHaveBeenCalled();
  });

  it('should show character counter', () => {
    const onChange = jest.fn();
    render(
      <NoteContent value="Hello world" onChange={onChange} maxLength={2000} />
    );

    expect(screen.getByText('11 / 2000')).toBeInTheDocument();
  });

  it('should highlight character counter when approaching limit', () => {
    const onChange = jest.fn();
    const content = 'a'.repeat(1900); // 95% of 2000

    render(
      <NoteContent value={content} onChange={onChange} maxLength={2000} />
    );

    const counter = screen.getByText('1900 / 2000');
    expect(counter).toHaveClass('text-warning');
  });

  it('should highlight character counter when at limit', () => {
    const onChange = jest.fn();
    const content = 'a'.repeat(2000);

    render(
      <NoteContent value={content} onChange={onChange} maxLength={2000} />
    );

    const counter = screen.getByText('2000 / 2000');
    expect(counter).toHaveClass('text-error');
  });

  it('should show warning message when approaching limit', () => {
    const onChange = jest.fn();
    const content = 'a'.repeat(1850);

    render(
      <NoteContent value={content} onChange={onChange} maxLength={2000} />
    );

    expect(
      screen.getByText(/approaching character limit/i)
    ).toBeInTheDocument();
  });

  it('should display error message', () => {
    const onChange = jest.fn();
    render(
      <NoteContent
        value=""
        onChange={onChange}
        error="Content is required"
      />
    );

    expect(screen.getByText('Content is required')).toBeInTheDocument();
  });

  it('should disable textarea when disabled prop is true', () => {
    const onChange = jest.fn();
    render(<NoteContent value="" onChange={onChange} disabled />);

    const textarea = screen.getByRole('textbox', { name: /note content/i });
    expect(textarea).toBeDisabled();
  });

  it('should auto-focus when autoFocus prop is true', () => {
    const onChange = jest.fn();
    render(<NoteContent value="" onChange={onChange} autoFocus />);

    const textarea = screen.getByRole('textbox', { name: /note content/i });
    expect(textarea).toHaveFocus();
  });

  it('should have proper accessibility attributes', () => {
    const onChange = jest.fn();
    render(<NoteContent value="Test" onChange={onChange} maxLength={2000} />);

    const characterCounter = screen.getByText('4 / 2000');
    expect(characterCounter).toHaveAttribute('aria-live', 'polite');
  });

  it('should respect maxLength', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<NoteContent value="" onChange={onChange} maxLength={10} />);

    const textarea = screen.getByRole('textbox', { name: /note content/i });
    expect(textarea).toHaveAttribute('maxlength', '10');
  });
});
