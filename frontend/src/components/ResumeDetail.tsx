import { useEffect, useState } from 'react';
import { fetchResume } from '../services/api';
import StatusBadge from './StatusBadge';
import type { Resume } from '../types';

interface Props {
  resumeId: string;
  onClose: () => void;
}

function formatDate(value?: string): string {
  if (!value) return 'Present';
  return new Date(value).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function ResumeDetail({ resumeId, onClose }: Props) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setResume(await fetchResume(resumeId));
      } finally {
        setLoading(false);
      }
    })();
  }, [resumeId]);

  const parsed = resume?.parsed;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center p-6 overflow-y-auto z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="font-medium">{resume?.fileName ?? 'Loading...'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">
            &times;
          </button>
        </div>

        {loading && <p className="p-6 text-sm text-gray-500">Loading...</p>}

        {!loading && resume && (
          <div className="p-6 space-y-6 text-sm">
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Contact</h3>
              <dl className="grid grid-cols-2 gap-y-1">
                <dt className="text-gray-500">Name</dt>
                <dd>{parsed?.name ?? '—'}</dd>
                <dt className="text-gray-500">Email</dt>
                <dd>{parsed?.email ?? '—'}</dd>
                <dt className="text-gray-500">Phone</dt>
                <dd>{parsed?.phone ?? '—'}</dd>
                <dt className="text-gray-500">Location</dt>
                <dd>{parsed?.location ?? '—'}</dd>
                <dt className="text-gray-500">Status</dt>
                <dd><StatusBadge status={resume.status} /></dd>
              </dl>
            </section>

            <section>
              <h3 className="font-medium text-gray-900 mb-2">
                Skills ({parsed?.skills.length ?? 0})
              </h3>
              {parsed?.skills.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No skills extracted</p>
              )}
            </section>

            <section>
              <h3 className="font-medium text-gray-900 mb-2">
                Experience ({parsed?.totalExperienceYears ?? 0} years total)
              </h3>
              {parsed?.experience.length ? (
                <ul className="space-y-2">
                  {parsed.experience.map((exp, i) => (
                    <li key={i} className="border-l-2 border-gray-200 pl-3">
                      <p className="font-medium">{exp.role ?? 'Role not found'}</p>
                      <p className="text-gray-600">{exp.company ?? '—'}</p>
                      <p className="text-gray-400 text-xs">
                        {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No experience entries extracted</p>
              )}
            </section>

            <section>
              <h3 className="font-medium text-gray-900 mb-2">Education</h3>
              {parsed?.education.length ? (
                <ul className="space-y-2">
                  {parsed.education.map((edu, i) => (
                    <li key={i} className="border-l-2 border-gray-200 pl-3">
                      <p className="font-medium">{edu.degree ?? '—'}</p>
                      <p className="text-gray-600">{edu.university ?? '—'}</p>
                      {edu.year && <p className="text-gray-400 text-xs">{edu.year}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No education entries extracted</p>
              )}
            </section>

            <section>
              <h3 className="font-medium text-gray-900 mb-2">Role matches</h3>
              <div className="space-y-2">
                {resume.roleMatches.map((match) => (
                  <div key={match.roleName} className="flex items-center gap-3">
                    <span className="w-44 text-gray-600">{match.roleName}</span>
                    <div className="flex-1 bg-gray-100 rounded h-2">
                      <div
                        className="bg-blue-600 h-2 rounded"
                        style={{ width: `${match.matchPercentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-gray-700">
                      {match.matchPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {resume.error && (
              <section>
                <h3 className="font-medium text-red-700 mb-1">Error</h3>
                <p className="text-red-600">{resume.error}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}