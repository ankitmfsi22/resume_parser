export const SECTION_PATTERNS = {
  experience:
    /^(work\s+experience|professional\s+experience|experience|employment(\s+history)?|career\s+history)\s*:?\s*$/i,
  education: /^(education|academic(\s+background)?|qualifications?)\s*:?\s*$/i,
} as const;

const ANY_HEADING =
  /^(work\s+experience|professional\s+experience|experience|employment|education|academic|qualifications?|skills?|technical\s+skills|projects?|certifications?|awards?|summary|objective|interests?|languages?|publications?|references?|achievements?|hobbies)\b\s*:?\s*$/i;

export function extractSection(text: string, heading: RegExp): string[] {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => heading.test(line.trim()));
  if (start === -1) return [];

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => ANY_HEADING.test(line.trim()));

  return (end === -1 ? rest : rest.slice(0, end)).map((l) => l.trim()).filter(Boolean);
}
