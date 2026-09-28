import { Resume } from '@resume-parser/shared';
import { asyncHandler } from '../utils/asyncHandler';
import { buildResumeFilter } from '../utils/query';

const COLUMNS = [
  'File Name',
  'Name',
  'Email',
  'Phone',
  'Location',
  'Skills',
  'Experience (years)',
  'Education',
  'Best Role Match',
  'Match %',
  'Status',
];

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export const exportResumesCsv = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const minScore = q.minScore !== undefined ? Number(q.minScore) : undefined;

  const filter = buildResumeFilter({
    keyword: q.keyword ? String(q.keyword) : undefined,
    location: q.location ? String(q.location) : undefined,
    role: q.role ? String(q.role) : undefined,
    status: q.status ? String(q.status) : undefined,
    minScore: Number.isFinite(minScore) ? minScore : undefined,
  });

  const resumes = await Resume.find(filter).select('-rawText').sort({ createdAt: -1 }).lean();

  const rows = resumes.map((r) => {
    const best = [...(r.roleMatches ?? [])].sort(
      (a, b) => b.matchPercentage - a.matchPercentage,
    )[0];

    const education = (r.parsed?.education ?? [])
      .map((e) => [e.degree, e.university].filter(Boolean).join(', '))
      .join(' | ');

    return [
      r.fileName,
      r.parsed?.name,
      r.parsed?.email,
      r.parsed?.phone,
      r.parsed?.location,
      (r.parsed?.skills ?? []).join('; '),
      r.parsed?.totalExperienceYears,
      education,
      best?.roleName,
      best?.matchPercentage,
      r.status,
    ].map(csvCell).join(',');
  });

  const csv = [COLUMNS.map(csvCell).join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="resumes.csv"');
  res.send(csv);
});