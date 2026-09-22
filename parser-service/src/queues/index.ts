import { type DefaultJobOptions, Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';
import type { FileType } from '../models/Resume';

export const QUEUE_NAMES = {
  PARSE: 'parse-queue',
  OCR: 'ocr-queue',
  INSIGHTS: 'insights-queue',
} as const;

export const RETRY_JOB_OPTIONS: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
};

export interface ParseJobData {
  resumeId: string;
  filePath: string;
  fileType: FileType;
}

export interface OcrJobData {
  resumeId: string;
  filePath: string;
  fileType: FileType;
}

export interface InsightsJobData {
  resumeId: string;
}

export const ocrQueue = new Queue<OcrJobData>(QUEUE_NAMES.OCR, {
  connection: redisConnectionOptions,
  defaultJobOptions: RETRY_JOB_OPTIONS,
});

export const insightsQueue = new Queue<InsightsJobData>(QUEUE_NAMES.INSIGHTS, {
  connection: redisConnectionOptions,
  defaultJobOptions: RETRY_JOB_OPTIONS,
});
