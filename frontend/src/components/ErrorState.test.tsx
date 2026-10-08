import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('shows the message', () => {
    render(<ErrorState message="Cannot reach the server" />);
    expect(screen.getByText('Cannot reach the server')).toBeInTheDocument();
  });

  it('hides the retry button when no handler is given', () => {
    render(<ErrorState message="Unsupported file" />);
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('calls the retry handler', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Network error" onRetry={onRetry} />);

    await userEvent.click(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
