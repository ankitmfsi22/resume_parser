import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { friendlyRequestError, friendlyResumeError } from './errors';

function axiosErrorWith(status: number, message?: string): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    data: message ? { error: { message } } : {},
  } as never;
  return error;
}

describe('friendlyResumeError', () => {
  it('explains a missing file without exposing the path', () => {
    const message = friendlyResumeError(
      "ENOENT: no such file or directory, open '/app/uploads/1790-abc.pdf'",
    );

    expect(message).toMatch(/could not be found/i);
    expect(message).not.toContain('/app/uploads');
    expect(message).not.toContain('ENOENT');
  });

  it('explains an unreadable scan', () => {
    expect(friendlyResumeError('OCR failed: OCR produced no text')).toMatch(
      /blank|scan quality/i,
    );
  });

  it('explains a damaged PDF', () => {
    expect(friendlyResumeError('Invalid PDF structure')).toMatch(/damaged/i);
  });

  it('falls back to a generic message for an unmapped error', () => {
    expect(friendlyResumeError('some internal failure')).toMatch(/could not be processed/i);
  });

  it('handles a null error', () => {
    expect(friendlyResumeError(null)).toMatch(/could not be processed/i);
  });
});

describe('friendlyRequestError', () => {
  it('explains that the server is unreachable, and offers a retry', () => {
    const result = friendlyRequestError(new AxiosError('Network Error'));

    expect(result.message).toMatch(/cannot reach the server/i);
    expect(result.retryable).toBe(true);
  });

  it('passes a validation message through without offering a retry', () => {
    const result = friendlyRequestError(axiosErrorWith(400, 'Unsupported file: notes.txt'));

    expect(result.message).toBe('Unsupported file: notes.txt');
    expect(result.retryable).toBe(false);
  });

  it('hides internal detail behind a generic message for server errors', () => {
    const result = friendlyRequestError(
      axiosErrorWith(500, 'Cannot read property parsed of undefined'),
    );

    expect(result.message).not.toContain('undefined');
    expect(result.message).toMatch(/server ran into a problem/i);
    expect(result.retryable).toBe(true);
  });

  it('treats a starting service as retryable', () => {
    expect(friendlyRequestError(axiosErrorWith(503)).retryable).toBe(true);
  });

  it('does not offer a retry for a missing item', () => {
    expect(friendlyRequestError(axiosErrorWith(404)).retryable).toBe(false);
  });

  it('handles a value that is not an axios error at all', () => {
    expect(friendlyRequestError(new Error('boom')).message).toMatch(/something went wrong/i);
  });
});