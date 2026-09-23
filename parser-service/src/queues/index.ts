import {
  getChannel,
  publishJob,
  ROUTING_KEYS,
  type InsightsJobData,
  type OcrJobData,
} from '@resume-parser/shared';

export function enqueueOcrJob(data: OcrJobData): boolean {
  return publishJob(getChannel(), ROUTING_KEYS.OCR, data);
}
export function enqueueInsightsJob(data: InsightsJobData): boolean {
  return publishJob(getChannel(), ROUTING_KEYS.INSIGHTS, data);
}