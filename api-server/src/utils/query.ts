export interface ResumeFilters {
  keyword?: string;
  location?: string;
  minScore?: number;
  role?: string;
  status?: string;
}
type MongoFilter = Record<string, unknown>;

export function buildResumeFilter(filters: ResumeFilters): MongoFilter {
  const query: MongoFilter = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.location) {
    query['parsed.location'] = { $regex: filters.location, $options: 'i' };
  }

  if (filters.keyword) {
    query.$or = [
      { 'parsed.skills': { $regex: filters.keyword, $options: 'i' } },
      { 'parsed.name': { $regex: filters.keyword, $options: 'i' } },
      { rawText: { $regex: filters.keyword, $options: 'i' } },
    ];
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