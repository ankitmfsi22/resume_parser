import {
  getChannel,
  QUEUES,
  Resume,
  startConsumer,
  type JobContext,
  type ParseJobData,
} from '@resume-parser/shared';
import { extractText } from '../extractors';

async function processParseJob(data: ParseJobData, ctx: JobContext): Promise<void> {
  const { resumeId, filePath, fileType } = data;

  console.log(
    `[resume ${resumeId}] Attempt ${ctx.attempt}/${ctx.maxAttempts}: extracting ${fileType} text`,
  );
  const rawText = await extractText(filePath, fileType);
  const updated = await Resume.findByIdAndUpdate(resumeId, {
    rawText,
    status: 'parsed',
    error: null,
    attempts: ctx.attempt,
  });
  if (!updated) {
    throw new Error(`Resume not found: ${resumeId}`);
  }
  console.log(`[resume ${resumeId}] Parsed (${rawText.length} chars)`);
}
async function markResumeFailed(
  data: ParseJobData,
  error: Error,
  attempts: number,
): Promise<void> {
  await Resume.findByIdAndUpdate(data.resumeId, {
    status: 'failed',
    error: error.message,
    attempts,
  });
}

export async function startParseWorker(): Promise<void> {
  await startConsumer<ParseJobData>({
    channel: getChannel(),
    queue: QUEUES.PARSE,
    handler: processParseJob,
    onFinalFailure: markResumeFailed,
  });
}