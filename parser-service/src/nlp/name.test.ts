import { describe, expect, it } from 'vitest';
import { extractLocation, extractName, isLikelyNameLine } from './name';

describe('isLikelyNameLine', () => {
  it('accepts a simple two word name', () => {
    expect(isLikelyNameLine('Ankit Singh')).toBe(true);
  });

  it('accepts a three word name', () => {
    expect(isLikelyNameLine('Priya Ramesh Sharma')).toBe(true);
  });

  it('rejects a job title', () => {
    expect(isLikelyNameLine('Senior Software Engineer')).toBe(false);
  });

  it('rejects a section heading', () => {
    expect(isLikelyNameLine('Work Experience')).toBe(false);
  });

  it('rejects a line containing contact details', () => {
    expect(isLikelyNameLine('Ankit Singh 9876543210')).toBe(false);
    expect(isLikelyNameLine('Ankit ankit@mail.com')).toBe(false);
  });

  it('rejects a single word', () => {
    expect(isLikelyNameLine('Ankit')).toBe(false);
  });

  it('rejects a lowercase line', () => {
    expect(isLikelyNameLine('ankit singh')).toBe(false);
  });
});

describe('extractName', () => {
  it('picks the name from the top of a resume', () => {
    const resume = ['Ankit Singh', 'Frontend Developer', 'ankit@example.com'].join('\n');
    expect(extractName(resume)).toBe('Ankit Singh');
  });

  it('skips a heading placed above the name', () => {
    const resume = ['RESUME', 'Priya Sharma', 'priya@example.com'].join('\n');
    expect(extractName(resume)).toBe('Priya Sharma');
  });

  it('converts an all caps name to title case', () => {
    expect(extractName('ANKIT SINGH\nDeveloper')).toBe('Ankit Singh');
  });

  it('returns undefined when no name is present', () => {
    expect(extractName('Skills\nReact, Node.js\nExperience')).toBeUndefined();
  });
});

describe('extractLocation', () => {
  it('finds a city mentioned near the contact details', () => {
    const resume = ['Ankit Singh', 'Delhi, India', 'ankit@example.com'].join('\n');
    expect(extractLocation(resume)).toBeTruthy();
  });

  it('returns undefined when no place is mentioned', () => {
    expect(extractLocation('Skills\nReact\nNode.js')).toBeUndefined();
  });
});