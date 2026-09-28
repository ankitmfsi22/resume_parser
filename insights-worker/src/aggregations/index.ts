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
  const [skills, universities, avgExperience, counts] = await Promise.all([
    topSkills(),
    commonUniversities(),
    averageExperience(),
    statusCounts(),
  ]);

  await Insight.updateOne(
    { key: 'global' },
    {
      $set: {
        topSkills: skills,
        commonUniversities: universities,
        averageExperience: avgExperience,
        totalResumes: counts.total,
        parsedCount: counts.parsed,
        failedCount: counts.failed,
      },
    },
    { upsert: true },
  );

  console.log(
    `Insights updated — ${counts.parsed}/${counts.total} parsed, ` +
      `avg ${avgExperience}y, ${skills.length} skills, ${universities.length} universities`,
  );
}