export const EXCHANGES = {
  WORK: 'resume.work',
  RETRY: 'resume.retry',
} as const;

export const QUEUES = {
  PARSE: 'parse-queue',
  OCR: 'ocr-queue',
  INSIGHTS: 'insights-queue',
} as const;

export const ROUTING_KEYS = {
  PARSE: 'parse',
  OCR: 'ocr',
  INSIGHTS: 'insights',
} as const;

export const MAX_ATTEMPTS = 3;
export const RETRY_DELAYS_MS = [2000, 4000] as const;
export function retryQueueName(queue: string, delayMs: number): string {
  return `${queue}.retry.${delayMs}`;
}
export function failedQueueName(queue: string): string {
  return `${queue}.failed`;
}
export function getRetryDelayMs(attempt: number): number {
  const index = Math.min(Math.max(attempt, 1), RETRY_DELAYS_MS.length) - 1;
  return RETRY_DELAYS_MS[index];
}