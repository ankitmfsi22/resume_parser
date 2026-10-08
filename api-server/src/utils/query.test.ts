import { describe, expect, it } from 'vitest';
import { buildResumeFilter } from './query';

describe('buildResumeFilter', () => {
  it('returns an empty filter when nothing is set', () => {
    expect(buildResumeFilter({})).toEqual({});
  });

  it('matches location partially and case-insensitively', () => {
    const filter = buildResumeFilter({ location: 'del' });

    expect(filter['parsed.location']).toEqual({ $regex: 'del', $options: 'i' });
  });

  it('searches skills, name and raw text for a keyword', () => {
    const filter = buildResumeFilter({ keyword: 'react' });

    expect(filter.$or).toHaveLength(3);
  });

  it('keeps the role and score conditions on the same match entry', () => {
    const filter = buildResumeFilter({ role: 'Frontend Developer', minScore: 50 });
    expect(filter.roleMatches).toEqual({
      $elemMatch: {
        roleName: 'Frontend Developer',
        matchPercentage: { $gte: 50 },
      },
    });
  });

  it('ignores zero-score roles when filtering by role alone', () => {
    const filter = buildResumeFilter({ role: 'DevOps Engineer' });

    expect(filter.roleMatches).toEqual({
      $elemMatch: {
        roleName: 'DevOps Engineer',
        matchPercentage: { $gte: 1 },
      },
    });
  });

  it('allows a score filter without naming a role', () => {
    const filter = buildResumeFilter({ minScore: 70 });

    expect(filter.roleMatches).toEqual({
      $elemMatch: { matchPercentage: { $gte: 70 } },
    });
  });

  it('combines status with the other filters', () => {
    const filter = buildResumeFilter({ status: 'parsed', location: 'goa' });

    expect(filter.status).toBe('parsed');
    expect(filter['parsed.location']).toBeDefined();
  });
});
it('matches a skill exactly when drilling into a chart', () => {
  const filter = buildResumeFilter({ skill: 'React' });

  expect(filter['parsed.skills']).toBe('React');
});

it('builds a range for an experience bucket', () => {
  const filter = buildResumeFilter({ minExperience: 3, maxExperience: 5 });

  expect(filter['parsed.totalExperienceYears']).toEqual({ $gte: 3, $lte: 5 });
});

it('builds an open-ended range for the top bucket', () => {
  const filter = buildResumeFilter({ minExperience: 11 });

  expect(filter['parsed.totalExperienceYears']).toEqual({ $gte: 11 });
});

it('escapes regex characters in a keyword', () => {
  const filter = buildResumeFilter({ keyword: 'C++' });
  const or = filter.$or as { 'parsed.skills'?: { $regex: string } }[];

  expect(or[0]['parsed.skills']?.$regex).toBe('C\\+\\+');
});
