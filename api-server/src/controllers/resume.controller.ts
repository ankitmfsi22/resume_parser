import { Insight, Resume } from '@resume-parser/shared';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildResumeFilter, type ResumeFilters } from '../utils/query';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const SORT_FIELDS: Record<string, string> = {
  createdAt: 'createdAt',
  name: 'parsed.name',
  experience: 'parsed.totalExperienceYears',
  fileName: 'fileName',
  status: 'status',
};

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toText(value: unknown): string | undefined {
  return value ? String(value) : undefined;
}

function parseFilters(query: Record<string, unknown>): ResumeFilters {
  return {
    keyword: toText(query.keyword),
    location: toText(query.location),
    role: toText(query.role),
    status: toText(query.status),
    skill: toText(query.skill),
    university: toText(query.university),
    minScore: toNumber(query.minScore),
    minExperience: toNumber(query.minExperience),
    maxExperience: toNumber(query.maxExperience),
  };
}

export const listResumes = asyncHandler(async (req, res) => {
  const query = req.query as Record<string, unknown>;

  const filter = buildResumeFilter(parseFilters(query));

  const limit = Math.min(toNumber(query.limit) ?? DEFAULT_LIMIT, MAX_LIMIT);
  const page = Math.max(toNumber(query.page) ?? 1, 1);
  const skip = (page - 1) * limit;
  const sortField = SORT_FIELDS[String(query.sortBy)] ?? 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;
  const [items, total] = await Promise.all([
    Resume.find(filter)
      .select('-rawText')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Resume.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    count: items.length,
    data: items,
  });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id).lean();
  if (!resume) throw ApiError.notFound('Resume not found');
  res.json({ success: true, data: resume });
});

export const getInsights = asyncHandler(async (_req, res) => {
  const insights = await Insight.findOne({ key: 'global' }).lean();

  res.json({
    success: true,
    data: insights ?? {
      topSkills: [],
      commonUniversities: [],
      topLocations: [],
      experienceDistribution: [],
      roleDistribution: [],
      averageExperience: 0,
      totalResumes: 0,
      parsedCount: 0,
      failedCount: 0,
    },
  });
});