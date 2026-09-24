import { getChannel, publishJob, ROUTING_KEYS, type ParseJobData } from '@resume-parser/shared';

export function enqueueParseJob(data: ParseJobData): boolean {
  return publishJob(getChannel(), ROUTING_KEYS.PARSE, data);
}