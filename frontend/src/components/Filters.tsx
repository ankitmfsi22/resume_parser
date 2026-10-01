import type { ResumeFilters } from '../types';

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
];

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'parsed', label: 'Complete' },
  { value: 'failed', label: 'Failed' },
  { value: 'ocr', label: 'Processing (OCR)' },
  { value: 'uploaded', label: 'Processing (queued)' },
];

interface Props {
  filters: ResumeFilters;
  onChange: (filters: ResumeFilters) => void;
  onReset: () => void;
  csvUrl: string;
}

export default function Filters({ filters, onChange, onReset, csvUrl }: Props) {
  function update(key: keyof ResumeFilters, value: string): void {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="bg-white rounded border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Keyword (skill or name)"
          value={filters.keyword ?? ''}
          onChange={(e) => update('keyword', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Location"
          value={filters.location ?? ''}
          onChange={(e) => update('location', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <select
          value={filters.role ?? ''}
          onChange={(e) => update('role', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          max={100}
          placeholder="Min match %"
          value={filters.minScore ?? ''}
          onChange={(e) => update('minScore', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

          <select
          value={filters.status ?? ''}
          onChange={(e) => update('status', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-sm border rounded text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
        <a
          href={csvUrl}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export CSV
        </a>
      </div>
    </div>
  );
}