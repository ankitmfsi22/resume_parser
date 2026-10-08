import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchResume } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import type { Resume } from '../types';
import ErrorState from '../components/ErrorState';
import { friendlyRequestError, friendlyResumeError, type RequestError } from '../utils/errors';

function formatDate(value?: string): string {
  if (!value) return 'Present';
  return new Date(value).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded border p-6">
      <h2 className="font-medium text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<RequestError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;

    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        setResume(await fetchResume(id));
      } catch (err) {
        setLoadError(friendlyRequestError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reloadKey]);

  function goBack(): void {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/resumes');
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading resume...</p>;

  if (loadError || !resume) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/resumes')}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <span className="text-lg leading-none">‹</span> Back to list
        </button>

        <ErrorState
          variant="block"
          message={loadError?.message ?? 'This resume could not be found.'}
          onRetry={loadError?.retryable ? () => setReloadKey((k) => k + 1) : undefined}
        />
      </div>
    );
  }

  const parsed = resume.parsed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <span className="text-lg leading-none">‹</span> Back to list
        </button>

        <StatusBadge status={resume.status} />
      </div>

      <div className="bg-white rounded border p-6">
        <h1 className="text-2xl font-semibold text-gray-900">{parsed?.name ?? 'Name not found'}</h1>
        <p className="text-sm text-gray-400 mt-1">{resume.fileName}</p>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="mt-0.5 break-all">{parsed?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd className="mt-0.5">{parsed?.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Location</dt>
            <dd className="mt-0.5">{parsed?.location ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Experience</dt>
            <dd className="mt-0.5">{parsed?.totalExperienceYears ?? 0} years</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title={`Skills (${parsed?.skills.length ?? 0})`}>
            {parsed?.skills.length ? (
              <div className="flex flex-wrap gap-1.5">
                {parsed.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No skills extracted</p>
            )}
          </Section>

          <Section title="Experience">
            {parsed?.experience.length ? (
              <ul className="space-y-4">
                {parsed.experience.map((exp, i) => (
                  <li key={i} className="border-l-2 border-blue-200 pl-4">
                    <p className="font-medium">{exp.role ?? 'Role not found'}</p>
                    <p className="text-sm text-gray-600">{exp.company ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No experience entries extracted</p>
            )}
          </Section>

          <Section title="Education">
            {parsed?.education.length ? (
              <ul className="space-y-4">
                {parsed.education.map((edu, i) => (
                  <li key={i} className="border-l-2 border-green-200 pl-4">
                    <p className="font-medium">{edu.degree ?? '—'}</p>
                    <p className="text-sm text-gray-600">{edu.university ?? '—'}</p>
                    {edu.year && <p className="text-xs text-gray-400 mt-0.5">{edu.year}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No education entries extracted</p>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Role matches">
            <div className="space-y-3">
              {resume.roleMatches.map((match) => (
                <div key={match.roleName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{match.roleName}</span>
                    <span className="font-medium text-gray-900">{match.matchPercentage}%</span>
                  </div>
                  <div className="bg-gray-100 rounded h-2">
                    <div
                      className="bg-blue-600 h-2 rounded"
                      style={{ width: `${match.matchPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {resume.error && (
            <Section title="Why this failed">
              <p className="text-sm text-red-700">{friendlyResumeError(resume.error)}</p>

              {/* The raw error stays available for debugging, just out of the way */}
              <details className="mt-3">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  Technical details
                </summary>
                <p className="text-xs text-gray-500 mt-1.5 font-mono break-all">{resume.error}</p>
              </details>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
