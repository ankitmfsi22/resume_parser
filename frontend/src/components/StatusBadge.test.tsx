import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('shows a plain label instead of the internal status', () => {
    render(<StatusBadge status="parsed" />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('groups every in-progress status under one label', () => {
    const { container: uploaded } = render(<StatusBadge status="uploaded" />);
    const { container: ocr } = render(<StatusBadge status="ocr" />);

    expect(uploaded.textContent).toBe('Processing');
    expect(ocr.textContent).toBe('Processing');
  });

  it('uses a different colour for complete and failed', () => {
    const { container: complete } = render(<StatusBadge status="parsed" />);
    const { container: failed } = render(<StatusBadge status="failed" />);

    expect(complete.firstChild).toHaveClass('bg-green-100');
    expect(failed.firstChild).toHaveClass('bg-red-100');
  });

  it('falls back to the raw value for an unknown status', () => {
    render(<StatusBadge status="something-new" />);
    expect(screen.getByText('something-new')).toBeInTheDocument();
  });
});
