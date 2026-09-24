import { describe, expect, it } from 'vitest';
import { comparePageNumbers } from './pdfToImages';

describe('comparePageNumbers', () => {
  it('orders pages numerically, not alphabetically', () => {
    const files = ['page-10.png', 'page-2.png', 'page-1.png'];
    expect(files.sort(comparePageNumbers)).toEqual([
      'page-1.png',
      'page-2.png',
      'page-10.png',
    ]);
  });

  it('keeps a long document in the right order', () => {
    const files = ['page-12.png', 'page-3.png', 'page-21.png', 'page-1.png'];
    expect(files.sort(comparePageNumbers)).toEqual([
      'page-1.png',
      'page-3.png',
      'page-12.png',
      'page-21.png',
    ]);
  });
});