import fs from 'fs/promises';
import {
  getChannel,
  QUEUES,
  Resume,
  startConsumer,
  type JobContext,
  type OcrJobData,
} from '@resume-parser/shared';
import { extractTextWithOcr } from '../ocr';
import { enqueueParseJob } from '../queues';

async function processOcrJob(data: OcrJobData, ctx: JobContext): Promise<void> {
  const { resumeId, filePath, fileType } = data;

  console.log(
    `resume ${resumeId}] Attempt ${ctx.attempt}/${ctx.maxAttempts}: OCR on ${fileType}`,
  );
  await fs.access(filePath);
  const { text, pages } = await extractTextWithOcr(filePath, fileType);
  if (!text) {
    throw new Error('OCR produced no text (file may be blank or unreadable)');
  }
  enqueueParseJob({ resumeId, filePath, fileType, text });

  console.log(
    `[resume ${resumeId}] OCR done (${pages} page(s), ${text.length} chars), sent back to parse-queue`,
  );
}

async function markResumeFailed(
  data: OcrJobData,
  error: Error,
  attempts: number,
): Promise<void> {
  await Resume.findByIdAndUpdate(data.resumeId, {
    status: 'failed',
    error: `OCR failed: ${error.message}`,
    attempts,
  });
}

export async function startOcrWorker(): Promise<void> {
  await startConsumer<OcrJobData>({
    channel: getChannel(),
    queue: QUEUES.OCR,
    handler: processOcrJob,
    onFinalFailure: markResumeFailed,
  });
}