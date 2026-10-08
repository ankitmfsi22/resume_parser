import { describe, expect, it } from 'vitest';
import { csvDownloadUrl } from './api';

describe('csvDownloadUrl', () => {
  it('builds a URL carrying the active filters', () => {
    const url = csvDownloadUrl({ keyword: 'react', minScore: '50' });

    expect(url).toContain('keyword=react');
    expect(url).toContain('minScore=50');
  });

  it('leaves empty filters out of the URL', () => {
    const url = csvDownloadUrl({ keyword: 'react', location: '', role: '' });

    expect(url).toContain('keyword=react');
    expect(url).not.toContain('location=');
    expect(url).not.toContain('role=');
  });

  it('returns a bare URL when nothing is filtered', () => {
    expect(csvDownloadUrl({})).toBe('/api/export/csv?');
  });

  it('encodes values that contain spaces', () => {
    const url = csvDownloadUrl({ role: 'Frontend Developer' });
    expect(url).toContain('Frontend+Developer');
  });
});
