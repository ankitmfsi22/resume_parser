import { Insight, Resume } from '@resume-parser/shared';

interface CountRow {
  _id: string;
  count: number;
}

async function topSkills(limit = 10): Promise<{ skill: string; count: number }[]> {
  const rows = await Resume.aggregate<CountRow>([
    { $match: { status: 'parsed' } },
    { $unwind: '$parsed.skills' },
    { $group: { _id: '$parsed.skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({ skill: r._id, count: r.count }));
}

async function commonUniversities(limit = 10): Promise<{ university: string; count: number }[]> {
  const rows = await Resume.aggregate<CountRow>([
    { $match: { status: 'parsed' } },
    { $unwind: '$parsed.education' },
    { $match: { 'parsed.education.university': { $nin: [null, ''] } } },
    { $group: { _id: '$parsed.education.university', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({ university: r._id, count: r.count }));
}

async function topLocations(limit = 10): Promise<{ location: string; count: number }[]> {
  const rows = await Resume.aggregate<CountRow>([
    { $match: { status: 'parsed', 'parsed.location': { $nin: [null, ''] } } },
    { $group: { _id: '$parsed.location', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({ location: r._id, count: r.count }));
}

/** Seniority spread — a single average hides whether the pool is junior or senior heavy */
async function experienceDistribution(): Promise<{ range: string; count: number }[]> {
  const rows = await Resume.aggregate<CountRow>([
    { $match: { status: 'parsed' } },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$parsed.totalExperienceYears', 3] }, then: '0-2 yrs' },
              { case: { $lt: ['$parsed.totalExperienceYears', 6] }, then: '3-5 yrs' },
              { case: { $lt: ['$parsed.totalExperienceYears', 11] }, then: '6-10 yrs' },
            ],
            default: '10+ yrs',
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);
  const ORDER = ['0-2 yrs', '3-5 yrs', '6-10 yrs', '10+ yrs'];
  const byRange = Object.fromEntries(rows.map((r) => [r._id, r.count]));

  return ORDER.map((range) => ({ range, count: byRange[range] ?? 0 }));
}

const STRONG_MATCH_THRESHOLD = 50;

async function roleDistribution(): Promise<{ roleName: string; count: number }[]> {
  const rows = await Resume.aggregate<CountRow>([
    { $match: { status: 'parsed' } },
    { $unwind: '$roleMatches' },
    { $match: { 'roleMatches.matchPercentage': { $gte: STRONG_MATCH_THRESHOLD } } },
    { $group: { _id: '$roleMatches.roleName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return rows.map((r) => ({ roleName: r._id, count: r.count }));
}

async function averageExperience(): Promise<number> {
  const rows = await Resume.aggregate<{ avg: number }>([
    { $match: { status: 'parsed' } },
    { $group: { _id: null, avg: { $avg: '$parsed.totalExperienceYears' } } },
  ]);

  return rows.length > 0 ? Math.round(rows[0].avg * 10) / 10 : 0;
}

async function statusCounts(): Promise<{ total: number; parsed: number; failed: number }> {
  const rows = await Resume.aggregate<CountRow>([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const byStatus = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return { total, parsed: byStatus.parsed ?? 0, failed: byStatus.failed ?? 0 };
}

export async function recalculateInsights(): Promise<void> {
  const [skills, universities, locations, experience, roles, avgExperience, counts] =
    await Promise.all([
      topSkills(),
      commonUniversities(),
      topLocations(),
      experienceDistribution(),
      roleDistribution(),
      averageExperience(),
      statusCounts(),
    ]);

  await Insight.updateOne(
    { key: 'global' },
    {
      $set: {
        topSkills: skills,
        commonUniversities: universities,
        topLocations: locations,
        experienceDistribution: experience,
        roleDistribution: roles,
        averageExperience: avgExperience,
        totalResumes: counts.total,
        parsedCount: counts.parsed,
        failedCount: counts.failed,
      },
    },
    { upsert: true },
  );

  console.log(
    `Insights updated — ${counts.parsed}/${counts.total} parsed, avg ${avgExperience}y, ` +
      `${skills.length} skills, ${locations.length} locations`,
  );
}
