import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('shows the status text', () => {
    render(<StatusBadge status="parsed" />);
    expect(screen.getByText('parsed')).toBeInTheDocument();
  });

  it('uses a different colour for each status', () => {
    const { container: parsed } = render(<StatusBadge status="parsed" />);
    const { container: failed } = render(<StatusBadge status="failed" />);

    expect(parsed.firstChild).toHaveClass('bg-green-100');
    expect(failed.firstChild).toHaveClass('bg-red-100');
  });

  it('falls back to a neutral style for an unknown status', () => {
    const { container } = render(<StatusBadge status="something-new" />);
    expect(container.firstChild).toHaveClass('bg-gray-100');
  });
});