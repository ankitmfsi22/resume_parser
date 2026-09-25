const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_CANDIDATE_PATTERN = /[+(]?\d[\d\s().-]{8,}\d/g;

export function extractEmail(text: string): string | undefined {
  const match = EMAIL_PATTERN.exec(text);
  if (!match) return undefined;
  return match[0].toLowerCase().replace(/\.$/, '');
}
function looksLikeDateRange(candidate: string): boolean {
  const years = candidate.match(/\b(19|20)\d{2}\b/g) ?? [];
  return years.length >= 2 || candidate.includes('/');
}

export function extractPhone(text: string): string | undefined {
  const candidates = text.match(PHONE_CANDIDATE_PATTERN) ?? [];
  for (const candidate of candidates) {
    if (looksLikeDateRange(candidate)) continue;
    const digits = candidate.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) continue;
    return candidate.trim().startsWith('+') ? `+${digits}` : digits;
  }
  return undefined;
}