import { describe, expect, it } from 'vitest';
import { hasEnoughText, MIN_TEXT_LENGTH, requiresOcrBeforeExtraction } from './routing';

describe('requiresOcrBeforeExtraction', () => {
  it('sends images straight to OCR', () => {
    expect(requiresOcrBeforeExtraction('image')).toBe(true);
  });

  it('does not send PDF or DOCX to OCR upfront', () => {
    expect(requiresOcrBeforeExtraction('pdf')).toBe(false);
    expect(requiresOcrBeforeExtraction('docx')).toBe(false);
  });
});

describe('hasEnoughText', () => {
  it('accepts text at or above the threshold', () => {
    expect(hasEnoughText('a'.repeat(MIN_TEXT_LENGTH))).toBe(true);
  });

  it('rejects text below the threshold (scanned PDF)', () => {
    expect(hasEnoughText('a'.repeat(MIN_TEXT_LENGTH - 1))).toBe(false);
  });

  it('rejects the few junk characters a scanned PDF usually yields', () => {
    expect(hasEnoughText('Page 1')).toBe(false);
  });

  it('rejects empty text', () => {
    expect(hasEnoughText('')).toBe(false);
  });

  it('ignores surrounding whitespace when measuring', () => {
    expect(hasEnoughText('   \n\n   ')).toBe(false);
  });
});