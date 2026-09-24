import { describe, expect, it } from 'vitest';
import { combinePageTexts, normalizeOcrText } from './index';

describe('combinePageTexts', () => {
  it('joins pages with a blank line between them', () => {
    expect(combinePageTexts(['page one', 'page two'])).toBe('page one\n\npage two');
  });

  it('skips pages that produced no text', () => {
    expect(combinePageTexts(['page one', '', '   ', 'page two'])).toBe('page one\n\npage two');
  });

  it('returns an empty string when every page is blank', () => {
    expect(combinePageTexts(['', '  ', '\n'])).toBe('');
  });

  it('handles a single page', () => {
    expect(combinePageTexts(['only page'])).toBe('only page');
  });
});

describe('normalizeOcrText', () => {
  it('collapses the extra spaces OCR usually produces', () => {
    expect(normalizeOcrText('John     Doe')).toBe('John Doe');
  });

  it('converts Windows line endings', () => {
    expect(normalizeOcrText('line one\r\nline two')).toBe('line one\nline two');
  });

  it('collapses three or more blank lines into one', () => {
    expect(normalizeOcrText('Skills\n\n\n\n\nReact')).toBe('Skills\n\nReact');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeOcrText('  resume text  ')).toBe('resume text');
  });
});