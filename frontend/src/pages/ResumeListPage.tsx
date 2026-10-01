import { useEffect, useState } from 'react';
import { csvDownloadUrl, fetchResumes } from '../services/api';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import type { Resume, ResumeFilters } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { friendlyRequestError, type RequestError } from '../utils/errors';

const DEBOUNCE_MS = 400;
const DEFAULT_PAGE_SIZE = 20;

type SortField = 'createdAt' | 'name' | 'experience' | 'fileName' | 'status';

const COLUMNS: { label: string; field?: SortField }[] = [
  { label: 'Name', field: 'name' },
  { label: 'Contact' },
  { label: 'Skills' },
  { label: 'Exp', field: 'experience' },
  { label: 'Match' },
  { label: 'Status', field: 'status' },
  { label: 'Uploaded', field: 'createdAt' },
];
const EMPTY_FILTERS: ResumeFilters = {
  keyword: '',
  location: '',
  role: '',
  minScore: '',
  status: '',
  skill: '',
  university: '',
  minExperience: '',
  maxExperience: '',
};

export default function ResumeListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [total, setTotal] = useState(0);
   const [error, setError] = useState<RequestError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ResumeFilters>(() => ({
    keyword: searchParams.get('keyword') ?? '',
    location: searchParams.get('location') ?? '',
    role: searchParams.get('role') ?? '',
    minScore: searchParams.get('minScore') ?? '',
    status: searchParams.get('status') ?? '',
    skill: searchParams.get('skill') ?? '',
    university: searchParams.get('university') ?? '',
    minExperience: searchParams.get('minExperience') ?? '',
    maxExperience: searchParams.get('maxExperience') ?? '',
  }));

    useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await fetchResumes({
            ...filters,
            page: String(page),
            limit: String(pageSize),
            sortBy,
            order,
          });
          setResumes(result.data);
          setTotal(result.total);
        } catch (err) {
          setError(friendlyRequestError(err));
          setResumes([]);
          setTotal(0);
        } finally {
          setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters, page, pageSize, sortBy, order, reloadKey]);

  function applyFilters(next: ResumeFilters): void {
    setFilters(next);
    setPage(1);
  }

  function changePageSize(size: number): void {
    setPageSize(size);
    setPage(1);
  }

  function toggleSort(field: SortField): void {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  }

  function displayMatch(resume: Resume) {
    if (filters.role) {
      return resume.roleMatches.find((m) => m.roleName === filters.role);
    }
    return [...resume.roleMatches].sort((a, b) => b.matchPercentage - a.matchPercentage)[0];
  }

  return (
    <div>
      <Filters
        filters={filters}
        onChange={applyFilters}
        onReset={() => applyFilters(EMPTY_FILTERS)}
        csvUrl={csvDownloadUrl(filters)}
      />
       {error && (
        <div className="mb-6">
          <ErrorState
            message={error.message}
            onRetry={error.retryable ? () => setReloadKey((k) => k + 1) : undefined}
          />
        </div>
      )}
      <div className="bg-white rounded border">
        <div className="px-6 py-3 border-b text-sm text-gray-600">
          {loading ? 'Loading...' : `${total} resume(s)`}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              {COLUMNS.map((column) => (
                <th
                  key={column.label}
                  onClick={() => column.field && toggleSort(column.field)}
                  className={`px-6 py-3 ${
                    column.field ? 'cursor-pointer select-none hover:text-gray-900' : ''
                  }`}
                >
                  {column.label === 'Match' && filters.role ? filters.role : column.label}
                  {column.field === sortBy && (
                    <span className="ml-1 text-blue-600">{order === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resumes.map((resume) => {
              const match = displayMatch(resume);

              return (
                <tr
                  key={resume._id}
                   onClick={() => navigate(`/resumes/${resume._id}`)}
                  className="border-b last:border-0 hover:bg-blue-50 cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <p className="font-medium">{resume.parsed?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{resume.fileName}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    <p>{resume.parsed?.email ?? '—'}</p>
                    <p className="text-xs">{resume.parsed?.location ?? ''}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {resume.parsed?.skills.slice(0, 3).join(', ') || '—'}
                    {(resume.parsed?.skills.length ?? 0) > 3 &&
                      ` +${(resume.parsed?.skills.length ?? 0) - 3}`}
                  </td>
                  <td className="px-6 py-3">{resume.parsed?.totalExperienceYears ?? 0}y</td>
                  <td className="px-6 py-3">
                    {match ? (
                      <>
                        {!filters.role && <span className="text-gray-700">{match.roleName} </span>}
                        <span className="text-blue-600 font-medium">
                          {match.matchPercentage}%
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={resume.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {new Date(resume.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              );
            })}

            {!loading && !error && resumes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6">
                  <EmptyState
                    title="No resumes match these filters"
                    hint="Try removing a filter, or upload more resumes"
                    action={{ label: 'Clear filters', onClick: () => applyFilters(EMPTY_FILTERS) }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </div>
    </div>
  );
}