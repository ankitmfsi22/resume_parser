interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const buttonClass =
    'w-8 h-8 flex items-center justify-center border rounded text-gray-600 ' +
    'disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50';

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          {from}–{to} of {total}
        </span>

        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            title="First page"
            className={buttonClass}
          >
            «
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            title="Previous page"
            className={buttonClass}
          >
            ‹
          </button>

          <span className="px-3 h-8 flex items-center text-gray-600">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Next page"
            className={buttonClass}
          >
            ›
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Last page"
            className={buttonClass}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}