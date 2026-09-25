import {
  getChannel,
  QUEUES,
  Resume,
  startConsumer,
  type JobContext,
  type ParseJobData,
} from '@resume-parser/shared';
import { extractText } from '../extractors';
import { enqueueOcrJob } from '../queues';
import { hasEnoughText, requiresOcrBeforeExtraction } from '../routing';
import { extractFields } from '../nlp';

async function sendToOcr(data: ParseJobData, reason: string): Promise<void> {
  const { resumeId, filePath, fileType } = data;

  await Resume.findByIdAndUpdate(resumeId, { status: 'ocr' });
  enqueueOcrJob({ resumeId, filePath, fileType });
  console.log(`[resume ${resumeId}] Sent to ocr-queue (${reason})`);
}

async function saveParsedText(resumeId: string, rawText: string, attempt: number): Promise<void> {
  const parsed = extractFields(rawText);

  const updated = await Resume.findByIdAndUpdate(resumeId, {
    rawText,
    parsed,
    status: 'parsed',
    error: null,
    attempts: attempt,
  });

  if (!updated) {
    throw new Error(`Resume not found: ${resumeId}`);
  }

  console.log(
    `[resume ${resumeId}] Parsed — ` +
    `name: ${parsed.name ?? 'not found'}, ` +
    `skills: ${parsed.skills.length}, ` +
    `experience: ${parsed.totalExperienceYears}y`,
  );
}
async function processParseJob(data: ParseJobData, ctx: JobContext): Promise<void> {
  const { resumeId, filePath, fileType, text } = data;
  console.log(
    `[resume ${resumeId}] Attempt ${ctx.attempt}/${ctx.maxAttempts}: processing ${fileType}`,
  );
  if (text) {
    console.log(`[resume ${resumeId}] Using OCR text (${text.length} chars)`);
    await saveParsedText(resumeId, text, ctx.attempt);
    return;
  }
  if (requiresOcrBeforeExtraction(fileType)) {
    await sendToOcr(data, 'image file');
    return;
  }
  const rawText = await extractText(filePath, fileType);
  if (!hasEnoughText(rawText)) {
    await sendToOcr(data, `only ${rawText.trim().length} chars extracted, likely scanned`);
    return;
  }
  await saveParsedText(resumeId, rawText, ctx.attempt);
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