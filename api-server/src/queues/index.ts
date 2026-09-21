import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';
import type { FileType } from '../models/Resume';

export const QUEUE_NAMES = {
  PARSE: 'parse-queue',
  OCR: 'ocr-queue',
  INSIGHTS: 'insights-queue',
} as const;

export interface ParseJobData {
  resumeId: string;
  filePath: string;
  fileType: FileType;
}

export const parseQueue = new Queue<ParseJobData>(QUEUE_NAMES.PARSE, {
  connection: redisConnectionOptions,
});
