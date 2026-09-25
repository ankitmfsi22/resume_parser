import nlp from 'compromise';

const HEADER_LINE_COUNT = 15;
const NON_NAME_WORDS = [
  'resume', 'curriculum', 'vitae', 'profile', 'summary', 'objective',
  'contact', 'experience', 'education', 'skills', 'projects',
  'developer', 'engineer', 'manager', 'analyst', 'designer',
  'consultant', 'intern', 'senior', 'junior', 'lead', 'architect',
];

function headerLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, HEADER_LINE_COUNT);
}
function normalizeName(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (cleaned !== cleaned.toUpperCase()) return cleaned;
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function isLikelyNameLine(line: string): boolean {
  const trimmed = line.trim();

  if (trimmed.length < 3 || trimmed.length > 50) return false;
  if (/[\d@]|https?:|www\./.test(trimmed)) return false;

  const lower = trimmed.toLowerCase();
  if (NON_NAME_WORDS.some((word) => lower.includes(word))) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  return words.every((word) => /^[A-Z][a-zA-Z.'-]*$/.test(word));
}

export function extractName(text: string): string | undefined {
  const lines = headerLines(text);
  const nameLine = lines.find(isLikelyNameLine);
  if (nameLine) return normalizeName(nameLine);
  const people = nlp(lines.join('\n')).people().out('array') as string[];
  const candidate = people.find((person) => person.trim().split(/\s+/).length >= 2);
  return candidate ? normalizeName(candidate) : undefined;
}
function firstPlace(chunk: string): string | undefined {
  const places = nlp(chunk).places().out('array') as string[];
  const place = places[0]?.replace(/[,.]$/, '').trim();
  return place || undefined;
}
export function extractLocation(text: string): string | undefined {
  const fromHeader = firstPlace(headerLines(text).join('\n'));
  if (fromHeader) return fromHeader;
  return firstPlace(text.slice(0, 3000));
}