import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Filters from './Filters';

const EMPTY = { keyword: '', location: '', role: '', minScore: '', status: '' };

describe('Filters', () => {
  it('reports what the user types in the keyword box', async () => {
    const onChange = vi.fn();
    render(
      <Filters filters={EMPTY} onChange={onChange} onReset={vi.fn()} csvUrl="/api/export/csv" />,
    );

    await userEvent.type(screen.getByPlaceholderText(/keyword/i), 'r');

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'r' }));
  });

  it('reports the selected role', async () => {
    const onChange = vi.fn();
    render(
      <Filters filters={EMPTY} onChange={onChange} onReset={vi.fn()} csvUrl="/api/export/csv" />,
    );

    await userEvent.selectOptions(screen.getByDisplayValue('All roles'), 'Frontend Developer');

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ role: 'Frontend Developer' }));
  });

  it('calls onReset when the reset button is clicked', async () => {
    const onReset = vi.fn();
    render(
      <Filters filters={EMPTY} onChange={vi.fn()} onReset={onReset} csvUrl="/api/export/csv" />,
    );

    await userEvent.click(screen.getByText('Reset'));

    expect(onReset).toHaveBeenCalledOnce();
  });

  it('carries the active filters into the CSV link', () => {
    render(
      <Filters
        filters={EMPTY}
        onChange={vi.fn()}
        onReset={vi.fn()}
        csvUrl="/api/export/csv?keyword=react&minScore=50"
      />,
    );

    expect(screen.getByText('Export CSV')).toHaveAttribute(
      'href',
      '/api/export/csv?keyword=react&minScore=50',
    );
  });
});
