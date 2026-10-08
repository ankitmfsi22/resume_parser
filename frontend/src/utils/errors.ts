import axios from 'axios';

const RESUME_ERRORS: { match: RegExp; message: string }[] = [
  {
    match: /ENOENT|no such file/i,
    message: 'The uploaded file could not be found. Please upload it again.',
  },
  {
    match: /produced no text|blank or unreadable/i,
    message:
      'No text could be read from this file. It may be blank, or the scan quality may be too low.',
  },
  {
    match: /Invalid PDF|stream must have data|bad XRef|FormatError/i,
    message: 'This PDF appears to be damaged and could not be opened.',
  },
  {
    match: /body element|not a valid zip|end of central directory/i,
    message: 'This Word document appears to be damaged and could not be opened.',
  },
  {
    match: /Command not found/i,
    message: 'Text recognition is unavailable right now. Please contact your administrator.',
  },
  {
    match: /timed out|ETIMEDOUT/i,
    message: 'This file took too long to process. Try a smaller or simpler file.',
  },
  {
    match: /Resume not found/i,
    message: 'This resume was removed while it was being processed.',
  },
];
export function friendlyResumeError(error: string | null | undefined): string {
  if (!error) return 'This resume could not be processed.';
  const known = RESUME_ERRORS.find((entry) => entry.match.test(error));
  return known?.message ?? 'This resume could not be processed. Please try uploading it again.';
}

export interface RequestError {
  message: string;
  retryable: boolean;
}
export function friendlyRequestError(error: unknown): RequestError {
  if (!axios.isAxiosError(error)) {
    return { message: 'Something went wrong. Please try again.', retryable: true };
  }

  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? {
          message: 'The request took too long. Please check your connection and try again.',
          retryable: true,
        }
      : {
          message: 'Cannot reach the server. Please check your connection and try again.',
          retryable: true,
        };
  }

  const status = error.response.status;
  const apiMessage = (error.response.data as { error?: { message?: string } })?.error?.message;

  switch (true) {
    case status === 400:
      return { message: apiMessage ?? 'That request was not valid.', retryable: false };
    case status === 401:
    case status === 403:
      return { message: 'You do not have permission to do that.', retryable: false };
    case status === 404:
      return { message: apiMessage ?? 'That item could not be found.', retryable: false };
    case status === 409:
      return { message: apiMessage ?? 'That item already exists.', retryable: false };
    case status === 413:
      return { message: 'The file is too large to upload.', retryable: false };
    case status === 429:
      return { message: 'Too many requests. Please wait a moment and try again.', retryable: true };
    case status === 503:
      return {
        message: 'The service is starting up. Please try again in a moment.',
        retryable: true,
      };
    case status >= 500:
      return {
        message: 'The server ran into a problem. Please try again shortly.',
        retryable: true,
      };
    default:
      return { message: 'Something went wrong. Please try again.', retryable: true };
  }
}
