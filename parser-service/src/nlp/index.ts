import type { IParsed } from '@resume-parser/shared';
import { extractEmail, extractPhone } from './contact';
import { extractTotalExperienceYears } from './experience';
import { extractLocation, extractName } from './name';
import { extractSkills } from './skills';

export function extractFields(rawText: string): IParsed {
  return {
    name: extractName(rawText),
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    location: extractLocation(rawText),
    skills: extractSkills(rawText),
    experience: [],
    totalExperienceYears: extractTotalExperienceYears(rawText),
    education: [],
  };
}