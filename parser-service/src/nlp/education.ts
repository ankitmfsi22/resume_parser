import type { IEducation } from '@resume-parser/shared';
import { extractSection, SECTION_PATTERNS } from './sections';

const DEGREE_PHRASES =
  /\b(bachelor(?:'?s)?(?:\s+of\s+[a-z]+)?|master(?:'?s)?(?:\s+of\s+[a-z]+)?|doctorate|ph\.?d|diploma|associate(?:'?s)?\s+degree)\b/i;
const DEGREE_ABBREVIATIONS =
  /(?<![A-Za-z])(B\.?Tech|B\.?E|B\.?Sc|B\.?A|B\.?Com|BCA|BBA|M\.?Tech|M\.?E|M\.?Sc|M\.?A|MCA|MBA|Ph\.?D)(?![A-Za-z])/;
const INSTITUTION_WORDS = /(university|college|institute|school|academy|polytechnic)/i;
const YEAR = /\b(19|20)\d{2}\b/;

export function isDegreeLine(line: string): boolean {
  return DEGREE_PHRASES.test(line) || DEGREE_ABBREVIATIONS.test(line);
}

export function cleanUniversity(value: string): string {
  return value
    .replace(/^(from|at)\s+/i, '')
    .replace(/,\s*[A-Z]{2}\s*$/, '') 
    .replace(/[,.\s]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function findUniversity(line: string): string | undefined {
  if (!INSTITUTION_WORDS.test(line)) return undefined;
  const segment =
    line
      .split(/\s+(?:from|at)\s+|[-–—:]/)
      .map((part) => part.trim())
      .find((part) => INSTITUTION_WORDS.test(part)) ?? line;

  const cleaned = cleanUniversity(segment);
  return cleaned.length >= 4 ? cleaned : undefined;
}

function cleanDegree(line: string): string {
  return line
    .replace(/\b(19|20)\d{2}\b/g, '')
    .replace(/^[●•*\-–—\s]+/, '')
    .replace(/\s+from\s+.*$/i, '')
    .replace(/[-–—,:.\s]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function extractEducation(text: string): IEducation[] {
  const lines = extractSection(text, SECTION_PATTERNS.education);
  if (lines.length === 0) return [];

  const entries: IEducation[] = [];
  for (let i = 0; i < lines.length && entries.length < 5; i++) {
    const line = lines[i];
    if (!isDegreeLine(line)) continue;
    const degree = cleanDegree(line);
    if (!degree) continue;
    let university = findUniversity(line);
    let yearMatch = YEAR.exec(line);

    for (let j = i + 1; j <= i + 2 && j < lines.length; j++) {
      if (isDegreeLine(lines[j])) break;
      university ??= findUniversity(lines[j]);
      yearMatch ??= YEAR.exec(lines[j]);
    }

    entries.push({
      degree,
      university,
      year: yearMatch ? Number(yearMatch[0]) : undefined,
    });
  }

  return entries;
}