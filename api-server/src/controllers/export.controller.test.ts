import { describe, expect, it } from 'vitest';
import { buildCsvRow, csvCell } from './export.controller';

describe('csvCell', () => {
  it('wraps every value in quotes', () => {
    expect(csvCell('hello')).toBe('"hello"');
  });

  it('keeps a value containing commas in one cell', () => {
    expect(csvCell('React, Node.js, MongoDB')).toBe('"React, Node.js, MongoDB"');
  });

  it('escapes double quotes by doubling them', () => {
    expect(csvCell('He said "hi"')).toBe('"He said ""hi"""');
  });

  it('renders null and undefined as empty cells', () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(undefined)).toBe('""');
  });

  it('converts numbers to text', () => {
    expect(csvCell(5)).toBe('"5"');
  });
});

describe('buildCsvRow', () => {
  const resume = {
    fileName: 'priya.pdf',
    status: 'parsed',
    parsed: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+919876543210',
      location: 'Bangalore',
      skills: ['React', 'Node.js'],
      totalExperienceYears: 5,
      education: [{ degree: 'B.E.', university: 'PES University' }],
    },
    roleMatches: [
      { roleName: 'Backend Developer', matchPercentage: 30 },
      { roleName: 'Frontend Developer', matchPercentage: 60 },
    ],
  };

  it('produces exactly eleven columns', () => {
    const cells = buildCsvRow(resume).split('","');
    expect(cells).toHaveLength(11);
  });

  it('joins skills with semicolons so they stay in one cell', () => {
    expect(buildCsvRow(resume)).toContain('"React; Node.js"');
  });

  it('picks the highest scoring role, not the first one', () => {
    const row = buildCsvRow(resume);
    expect(row).toContain('"Frontend Developer"');
    expect(row).toContain('"60"');
  });

  it('handles a resume with nothing extracted', () => {
    const empty = { fileName: 'broken.pdf', status: 'failed' };
    const cells = buildCsvRow(empty).split('","');

    expect(cells).toHaveLength(11);
    expect(buildCsvRow(empty)).toContain('"broken.pdf"');
  });
});
