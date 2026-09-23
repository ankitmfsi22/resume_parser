import type { FileType } from '../models/Resume';

export interface ParseJobData {
  resumeId: string;
  filePath: string;
  fileType: FileType;
  text?: string;
}
export interface OcrJobData {
  resumeId: string;
  filePath: string;
  fileType: FileType;
}
export interface InsightsJobData {
  resumeId: string;
}