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
export interface CsvRowInput {
  fileName: string;
  status: string;
  parsed?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    skills?: string[];
    totalExperienceYears?: number;
    education?: { degree?: string; university?: string }[];
  };
  roleMatches?: { roleName: string; matchPercentage: number }[];
}

export function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildCsvRow(resume: {
  fileName: string;
  status: string;
  parsed?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    skills?: string[];
    totalExperienceYears?: number;
    education?: { degree?: string; university?: string }[];
  };
  roleMatches?: { roleName: string; matchPercentage: number }[];
}): string {
  const best = [...(resume.roleMatches ?? [])].sort(
    (a, b) => b.matchPercentage - a.matchPercentage,
  )[0];

  const education = (resume.parsed?.education ?? [])
    .map((e) => [e.degree, e.university].filter(Boolean).join(', '))
    .join(' | ');

  return [
    resume.fileName,
    resume.parsed?.name,
    resume.parsed?.email,
    resume.parsed?.phone,
    resume.parsed?.location,
    (resume.parsed?.skills ?? []).join('; '),
    resume.parsed?.totalExperienceYears,
    education,
    best?.roleName,
    best?.matchPercentage,
    resume.status,
  ]
    .map(csvCell)
    .join(',');
}

export const exportResumesCsv = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const num = (value: unknown): number | undefined => {
    if (value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const text = (value: unknown): string | undefined => (value ? String(value) : undefined);
  const filter = buildResumeFilter({
    keyword: text(q.keyword),
    location: text(q.location),
    role: text(q.role),
    status: text(q.status),
    skill: text(q.skill),
    university: text(q.university),
    minScore: num(q.minScore),
    minExperience: num(q.minExperience),
    maxExperience: num(q.maxExperience),
  });
  const resumes = await Resume.find(filter).select('-rawText').sort({ createdAt: -1 }).lean();
  const rows = resumes.map((r) => buildCsvRow(r as CsvRowInput));
  const csv = [COLUMNS.map(csvCell).join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="resumes.csv"');
  res.send(csv);
});
