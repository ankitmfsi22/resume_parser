import { Insight, Resume } from '@resume-parser/shared';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildResumeFilter, type ResumeFilters } from '../utils/query';

const MAX_LIMIT = 100;

function parseFilters(query: Record<string, unknown>): ResumeFilters {
  const minScore = query.minScore !== undefined ? Number(query.minScore) : undefined;

  return {
    keyword: query.keyword ? String(query.keyword) : undefined,
    location: query.location ? String(query.location) : undefined,
    role: query.role ? String(query.role) : undefined,
    status: query.status ? String(query.status) : undefined,
    minScore: Number.isFinite(minScore) ? minScore : undefined,
  };
}

export const listResumes = asyncHandler(async (req, res) => {
  const filters = parseFilters(req.query as Record<string, unknown>);
  const limit = Math.min(Number(req.query.limit) || 50, MAX_LIMIT);

  const filter = buildResumeFilter(filters);

  const [items, total] = await Promise.all([
    Resume.find(filter)
      .select('-rawText')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Resume.countDocuments(filter),
  ]);

  res.json({ success: true, total, count: items.length, data: items });
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
      averageExperience: 0,
      totalResumes: 0,
      parsedCount: 0,
      failedCount: 0,
    },
  });
});