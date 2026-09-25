const EXPERIENCE_HEADING =
  /^(work\s+experience|professional\s+experience|experience|employment(\s+history)?|career\s+history)\s*:?\s*$/i;

  const OTHER_HEADING =
  /^(education|academic|skills|technical\s+skills|projects|certifications|awards|summary|objective|interests|languages|publications|references|achievements)\b/i;

const EXPLICIT_YEARS =
  /(\d{1,2})(?:\.\d)?\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:[a-z]+\s+)?experience/i;

const YEAR_RANGE =
  /\b((?:19|20)\d{2})\s*(?:-|–|—|to|until)\s*((?:19|20)\d{2}|present|current|now|till\s+date)\b/gi;

interface YearRange {
  start: number;
  end: number;
}

export function extractExperienceSection(text: string): string | undefined {
  const lines = text.split('\n');
  const startIndex = lines.findIndex((line) => EXPERIENCE_HEADING.test(line.trim()));
  if (startIndex === -1) return undefined;
  const rest = lines.slice(startIndex + 1);
  const endOffset = rest.findIndex((line) => OTHER_HEADING.test(line.trim()));
  const section = endOffset === -1 ? rest : rest.slice(0, endOffset);
  return section.join('\n');
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
  total += current.end - current.start;
  return total;
}

export function extractTotalExperienceYears(
  text: string,
  currentYear: number = new Date().getFullYear(),
): number {
  const explicit = EXPLICIT_YEARS.exec(text);
  if (explicit) return Number(explicit[1]);
  const scope = extractExperienceSection(text) ?? text;
  return mergeRanges(findYearRanges(scope, currentYear));
}