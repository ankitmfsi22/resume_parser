import { useEffect, useState } from 'react';
import { csvDownloadUrl, fetchResumes } from '../services/api';
import Filters from '../components/Filters';
import ResumeDetail from '../components/ResumeDetail';
import StatusBadge from '../components/StatusBadge';
import type { Resume, ResumeFilters } from '../types';

const EMPTY_FILTERS: ResumeFilters = {
  keyword: '',
  location: '',
  role: '',
  minScore: '',
  status: '',
};
const DEBOUNCE_MS = 400;

export default function ResumeListPage() {
  const [filters, setFilters] = useState<ResumeFilters>(EMPTY_FILTERS);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          const result = await fetchResumes(filters);
          setResumes(result.data);
          setTotal(result.total);
        } finally {
          setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters]);
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
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        csvUrl={csvDownloadUrl(filters)}
      />

      <div className="bg-white rounded border">
        <div className="px-6 py-3 border-b text-sm text-gray-600">
          {loading ? 'Loading...' : `${total} resume(s)`}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Skills</th>
              <th className="px-6 py-3">Exp</th>
              <th className="px-6 py-3">{filters.role ? filters.role : 'Best match'}</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((resume) => {
              const match = displayMatch(resume);

              return (
                <tr
                  key={resume._id}
                  onClick={() => setSelectedId(resume._id)}
                  className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
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
                        {!filters.role && (
                          <span className="text-gray-700">{match.roleName} </span>
                        )}
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
                </tr>
              );
            })}

            {!loading && resumes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No resumes match these filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <ResumeDetail resumeId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}