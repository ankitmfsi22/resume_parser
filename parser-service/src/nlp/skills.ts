import skillsData from '../data/skills.json';

interface SkillEntry {
  name: string;
  aliases: string[];
}

const SKILLS = skillsData as SkillEntry[];
const BOUNDARY_BEFORE = '(?<![a-zA-Z0-9+#.])';
const BOUNDARY_AFTER = '(?![a-zA-Z0-9+#])';

function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPattern(term: string): RegExp {
  return new RegExp(`${BOUNDARY_BEFORE}${escapeRegex(term)}${BOUNDARY_AFTER}`, 'i');
}

const COMPILED = SKILLS.map((skill) => ({
  name: skill.name,
  patterns: [skill.name, ...skill.aliases].map(buildPattern),
}));

export function extractSkills(text: string): string[] {
  const found: string[] = [];

  for (const skill of COMPILED) {
    if (skill.patterns.some((pattern) => pattern.test(text))) {
      found.push(skill.name);
    }
  }
  return found;
}