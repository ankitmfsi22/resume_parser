import type { IJobRole, IRoleMatch } from '@resume-parser/shared';

export function scoreRole(skills: string[], role: IJobRole): IRoleMatch {
  const normalized = new Set(skills.map((s) => s.toLowerCase()));

  const score = role.keywords.reduce(
    (sum, k) => (normalized.has(k.keyword.toLowerCase()) ? sum + k.weight : sum),
    0,
  );
  const maxScore = role.keywords.reduce((sum, k) => sum + k.weight, 0);
  return {
    roleName: role.name,
    score,
    matchPercentage: maxScore === 0 ? 0 : Math.round((score / maxScore) * 100),
  };
}

export function matchRoles(skills: string[], roles: IJobRole[]): IRoleMatch[] {
  return roles
    .map((role) => scoreRole(skills, role))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}