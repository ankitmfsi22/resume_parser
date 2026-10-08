export interface ResumeFilters {
  keyword?: string;
  location?: string;
  minScore?: number;
  role?: string;
  status?: string;
  skill?: string;
  university?: string;
  minExperience?: number;
  maxExperience?: number;
}

type MongoFilter = Record<string, unknown>;
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildResumeFilter(filters: ResumeFilters): MongoFilter {
  const query: MongoFilter = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.location) {
    query['parsed.location'] = { $regex: escapeRegex(filters.location), $options: 'i' };
  }

  if (filters.keyword) {
    query.$or = [
      { 'parsed.skills': { $regex: escapeRegex(filters.keyword), $options: 'i' } },
      { 'parsed.name': { $regex: escapeRegex(filters.keyword), $options: 'i' } },
      { rawText: { $regex: escapeRegex(filters.keyword), $options: 'i' } },
    ];
  }
  if (filters.skill) {
    query['parsed.skills'] = filters.skill;
  }

  if (filters.university) {
    query['parsed.education.university'] = filters.university;
  }

  if (filters.minExperience !== undefined || filters.maxExperience !== undefined) {
    const range: Record<string, number> = {};
    if (filters.minExperience !== undefined) range.$gte = filters.minExperience;
    if (filters.maxExperience !== undefined) range.$lte = filters.maxExperience;
    query['parsed.totalExperienceYears'] = range;
  }

  if (filters.role || filters.minScore !== undefined) {
    const match: Record<string, unknown> = {};
    if (filters.role) match.roleName = filters.role;
    const minScore = filters.minScore ?? (filters.role ? 1 : undefined);
    if (minScore !== undefined) match.matchPercentage = { $gte: minScore };

    query.roleMatches = { $elemMatch: match };
  }

  return query;
}
