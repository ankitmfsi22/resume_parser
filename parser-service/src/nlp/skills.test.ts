import { describe, expect, it } from 'vitest';
import { extractSkills } from './skills';

describe('extractSkills', () => {
  it('finds skills listed in a comma separated line', () => {
    const skills = extractSkills('Skills: React, Node.js, MongoDB');
    expect(skills).toContain('React');
    expect(skills).toContain('Node.js');
    expect(skills).toContain('MongoDB');
  });

  it('is case insensitive', () => {
    expect(extractSkills('experience with REACT and typescript')).toEqual(
      expect.arrayContaining(['React', 'TypeScript']),
    );
  });

  it('maps an alias to its canonical name', () => {
    expect(extractSkills('Built the API in nodejs')).toContain('Node.js');
    expect(extractSkills('Strong in reactjs')).toContain('React');
  });

  it('does not match a skill hidden inside a longer word', () => {
    expect(extractSkills('Worked at Google on a category page')).not.toContain('Go');
  });

  it('handles skills with special characters', () => {
    expect(extractSkills('Languages: C++, C#, .NET')).toEqual(
      expect.arrayContaining(['C++', 'C#', '.NET']),
    );
  });

  it('reports each skill only once', () => {
    const skills = extractSkills('React developer. Built React apps using React hooks.');
    expect(skills.filter((s) => s === 'React')).toHaveLength(1);
  });

  it('returns an empty array when nothing matches', () => {
    expect(extractSkills('Passionate and hardworking team player')).toEqual([]);
  });
});