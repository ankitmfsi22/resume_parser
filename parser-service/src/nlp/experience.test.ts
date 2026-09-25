import { describe, expect, it } from 'vitest';
import {
  extractExperienceSection,
  extractTotalExperienceYears,
  findYearRanges,
  mergeRanges,
} from './experience';

describe('extractExperienceSection', () => {
  it('returns only the lines under the experience heading', () => {
    const resume = [
      'Ankit Singh',
      'Work Experience',
      'Acme Corp 2019 - 2022',
      'Education',
      'B.Tech 2015 - 2019',
    ].join('\n');

    const section = extractExperienceSection(resume);
    expect(section).toContain('Acme Corp');
    expect(section).not.toContain('B.Tech');
  });

  it('returns undefined when there is no experience heading', () => {
    expect(extractExperienceSection('Skills\nReact\nNode.js')).toBeUndefined();
  });
});

describe('findYearRanges', () => {
  it('reads a plain year range', () => {
    expect(findYearRanges('2019 - 2022', 2026)).toEqual([{ start: 2019, end: 2022 }]);
  });

  it('treats Present as the current year', () => {
    expect(findYearRanges('2020 to Present', 2026)).toEqual([{ start: 2020, end: 2026 }]);
  });

  it('ignores a reversed range', () => {
    expect(findYearRanges('2022 - 2019', 2026)).toEqual([]);
  });
});

describe('mergeRanges', () => {
  it('adds up separate periods', () => {
    expect(mergeRanges([{ start: 2015, end: 2017 }, { start: 2019, end: 2022 }])).toBe(5);
  });

  it('does not count overlapping periods twice', () => {
    expect(mergeRanges([{ start: 2019, end: 2022 }, { start: 2021, end: 2023 }])).toBe(4);
  });

  it('returns zero for no ranges', () => {
    expect(mergeRanges([])).toBe(0);
  });
});

describe('extractTotalExperienceYears', () => {
  it('prefers an explicitly stated number of years', () => {
    expect(extractTotalExperienceYears('5+ years of experience in web development', 2026)).toBe(5);
  });

  it('reads an explicit statement with a qualifier', () => {
    expect(extractTotalExperienceYears('4 years of professional experience', 2026)).toBe(4);
  });

  it('falls back to the dates in the experience section', () => {
    const resume = [
      'Work Experience',
      'Acme Corp, Developer, 2019 - 2022',
      'Beta Ltd, Senior Developer, 2022 - Present',
    ].join('\n');

    expect(extractTotalExperienceYears(resume, 2026)).toBe(7);
  });

  it('ignores education dates when an experience section exists', () => {
    const resume = [
      'Work Experience',
      'Acme Corp 2022 - 2024',
      'Education',
      'B.Tech 2015 - 2019',
    ].join('\n');

    expect(extractTotalExperienceYears(resume, 2026)).toBe(2);
  });

  it('returns zero when there is nothing to work with', () => {
    expect(extractTotalExperienceYears('Skills: React, Node.js', 2026)).toBe(0);
  });
});