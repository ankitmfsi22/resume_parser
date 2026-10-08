import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

function setup(overrides: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  const props = {
    page: 1,
    pageSize: 20,
    total: 100,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    ...overrides,
  };

  render(<Pagination {...props} />);
  return props;
}

describe('Pagination', () => {
  it('shows which rows are currently visible', () => {
    setup({ page: 2, pageSize: 20, total: 100 });
    expect(screen.getByText('21–40 of 100')).toBeInTheDocument();
  });

  it('caps the upper bound on the last page', () => {
    setup({ page: 3, pageSize: 20, total: 45 });
    expect(screen.getByText('41–45 of 45')).toBeInTheDocument();
  });

  it('shows a zero range when there are no results', () => {
    setup({ page: 1, pageSize: 20, total: 0 });
    expect(screen.getByText('0–0 of 0')).toBeInTheDocument();
  });

  it('works out the number of pages from the total and page size', () => {
    setup({ page: 1, pageSize: 20, total: 45 });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('moves forward and back one page at a time', async () => {
    const { onPageChange } = setup({ page: 2, total: 100 });

    await userEvent.click(screen.getByTitle('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await userEvent.click(screen.getByTitle('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('jumps to the first and last page', async () => {
    const { onPageChange } = setup({ page: 3, pageSize: 20, total: 100 });

    await userEvent.click(screen.getByTitle('Last page'));
    expect(onPageChange).toHaveBeenCalledWith(5);

    await userEvent.click(screen.getByTitle('First page'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('disables the back controls on the first page', () => {
    setup({ page: 1, total: 100 });

    expect(screen.getByTitle('First page')).toBeDisabled();
    expect(screen.getByTitle('Previous page')).toBeDisabled();
    expect(screen.getByTitle('Next page')).toBeEnabled();
  });

  it('disables the forward controls on the last page', () => {
    setup({ page: 5, pageSize: 20, total: 100 });

    expect(screen.getByTitle('Next page')).toBeDisabled();
    expect(screen.getByTitle('Last page')).toBeDisabled();
    expect(screen.getByTitle('Previous page')).toBeEnabled();
  });

  it('disables every control when a single page holds everything', () => {
    setup({ page: 1, pageSize: 20, total: 5 });

    expect(screen.getByTitle('Previous page')).toBeDisabled();
    expect(screen.getByTitle('Next page')).toBeDisabled();
  });

  it('reports a new page size as a number', async () => {
    const { onPageSizeChange } = setup();

    await userEvent.selectOptions(screen.getByDisplayValue('20'), '50');

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
