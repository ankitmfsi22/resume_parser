import { describe, expect, it } from 'vitest';
import type { IJobRole } from '@resume-parser/shared';
import { matchRoles, scoreRole } from './scorer';

const frontend = {
  name: 'Frontend Developer',
  keywords: [
    { keyword: 'react', weight: 3 },
    { keyword: 'javascript', weight: 3 },
    { keyword: 'html', weight: 1 },
    { keyword: 'css', weight: 1 },
  ],
} as IJobRole;

describe('scoreRole', () => {
  it('gives 100 percent when every keyword matches', () => {
    const result = scoreRole(['React', 'JavaScript', 'HTML', 'CSS'], frontend);
    expect(result.score).toBe(8);
    expect(result.matchPercentage).toBe(100);
  });

  it('weights important skills more heavily', () => {
    const heavy = scoreRole(['React', 'JavaScript'], frontend);
    const light = scoreRole(['HTML', 'CSS'], frontend);
    expect(heavy.matchPercentage).toBe(75);
    expect(light.matchPercentage).toBe(25);
  });

  it('is case insensitive', () => {
    expect(scoreRole(['react', 'JAVASCRIPT'], frontend).score).toBe(6);
  });

  it('returns zero when nothing matches', () => {
    const result = scoreRole(['Python', 'Django'], frontend);
    expect(result.score).toBe(0);
    expect(result.matchPercentage).toBe(0);
  });

  it('ignores skills that are not part of the role', () => {
    expect(scoreRole(['React', 'Docker', 'Kubernetes'], frontend).score).toBe(3);
  });
});

describe('matchRoles', () => {
  const backend = {
    name: 'Backend Developer',
    keywords: [
      { keyword: 'node.js', weight: 3 },
      { keyword: 'mongodb', weight: 2 },
    ],
  } as IJobRole;

  it('returns the best matching role first', () => {
    const results = matchRoles(['React', 'JavaScript', 'HTML', 'CSS'], [backend, frontend]);
    expect(results[0].roleName).toBe('Frontend Developer');
  });

  it('returns an entry for every role', () => {
    expect(matchRoles(['React'], [frontend, backend])).toHaveLength(2);
  });
});
