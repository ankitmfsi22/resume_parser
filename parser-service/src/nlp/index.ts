import { JobRole, type IJobRole, type IParsed, type IRoleMatch } from '@resume-parser/shared';
import { matchRoles } from '../matching/scorer';
import { extractEmail, extractPhone } from './contact';
import { extractEducation } from './education';
import { extractExperience, extractTotalExperienceYears } from './experience';
import { extractLocation, extractName } from './name';
import { extractSkills } from './skills';

export function extractFields(rawText: string): IParsed {
  return {
    name: extractName(rawText),
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    location: extractLocation(rawText),
    skills: extractSkills(rawText),
    experience: extractExperience(rawText),
    totalExperienceYears: extractTotalExperienceYears(rawText),
    education: extractEducation(rawText),
  };
}
let cachedRoles: IJobRole[] | null = null;

export async function computeRoleMatches(skills: string[]): Promise<IRoleMatch[]> {
  cachedRoles ??= await JobRole.find().lean<IJobRole[]>();

  if (cachedRoles.length === 0) {
    console.warn('No job roles found. Run: npm run seed:roles');
    return [];
  }

  return matchRoles(skills, cachedRoles);
}