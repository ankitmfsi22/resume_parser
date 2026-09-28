import * as chrono from 'chrono-node';
import type { IExperience } from '@resume-parser/shared';
import { extractSection, SECTION_PATTERNS } from './sections';

const EXPLICIT_YEARS =
  /(\d{1,2})(?:\.\d)?\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:[a-z]+\s+)?experience/i;
const YEAR_RANGE =
  /\b((?:19|20)\d{2})\s*(?:-|–|—|to|until)\s*((?:19|20)\d{2}|present|current|now|till\s+date)\b/gi;
const ROLE_WORDS =
  /(developer|engineer|manager|analyst|designer|consultant|intern|architect|lead|specialist|administrator|scientist|executive|officer|associate|director)/i;

interface YearRange {
  start: number;
  end: number;
}

export function findYearRanges(text: string, currentYear: number): YearRange[] {
  const ranges: YearRange[] = [];

  for (const match of text.matchAll(YEAR_RANGE)) {
    const start = Number(match[1]);
    const rawEnd = match[2].toLowerCase();
    const end = /^\d{4}$/.test(rawEnd) ? Number(rawEnd) : currentYear;

    if (end < start || start > currentYear) continue;
    ranges.push({ start, end });
  }

  return ranges;
}
export function mergeRanges(ranges: YearRange[]): number {
  if (ranges.length === 0) return 0;

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let total = 0;
  let current = { ...sorted[0] };

  for (const range of sorted.slice(1)) {
    if (range.start <= current.end) {
      current.end = Math.max(current.end, range.end);
    } else {
      total += current.end - current.start;
      current = { ...range };
    }
  }

  return total + (current.end - current.start);
}

export function extractTotalExperienceYears(
  text: string,
  currentYear: number = new Date().getFullYear(),
): number {
  const explicit = EXPLICIT_YEARS.exec(text);
  if (explicit) return Number(explicit[1]);

  const section = extractSection(text, SECTION_PATTERNS.experience);
  const scope = section.length > 0 ? section.join('\n') : text;

  return mergeRanges(findYearRanges(scope, currentYear));
}

export function cleanEntryLine(line: string): string {
  return line
    .replace(/\(?\b(?:19|20)\d{2}\b[^)]*\)?/g, '')
    .replace(/\b(present|current|now|till\s+date)\b/gi, '')
    .replace(/\b(0?[1-9]|1[0-2])\/(19|20)\d{2}\b/g, '')
    .replace(/^[●•*\-–—\s]+/, '')
    .replace(/[-–—,|]+\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseDates(line: string): { startDate?: Date; endDate?: Date } {
  const results = chrono.parse(line);
  if (results.length === 0) return {};

  const startDate = results[0].start?.date();
  const endDate =
    results.length > 1
      ? results[1].start?.date()
      : results[0].end?.date();

  const isOngoing = /\b(present|current|now|till\s+date)\b/i.test(line);

  return { startDate, endDate: isOngoing ? undefined : endDate };
}

export function extractExperience(text: string): IExperience[] {
  const lines = extractSection(text, SECTION_PATTERNS.experience);
  if (lines.length === 0) return [];

  const entries: IExperience[] = [];

  for (let i = 0; i < lines.length && entries.length < 10; i++) {
    const line = lines[i];

    if (!/\b(19|20)\d{2}\b/.test(line)) continue;

    const { startDate, endDate } = parseDates(line);
    if (!startDate) continue;

    const role = cleanEntryLine(line);
    if (!role) continue;
    let company: string | undefined;
    const next = lines[i + 1];
    if (next && !/\b(19|20)\d{2}\b/.test(next) && !/^[●•*\-–—]/.test(next) && next.length < 80) {
      company = cleanEntryLine(next);
    }
    if (ROLE_WORDS.test(role)) {
      entries.push({ role, company, startDate, endDate });
    } else {
      entries.push({ role: undefined, company: company ?? role, startDate, endDate });
    }
  }

  return entries;
}