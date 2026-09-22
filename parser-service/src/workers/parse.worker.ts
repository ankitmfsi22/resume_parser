import { type Job, Worker } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';
import { extractText } from '../extractors';
import { Resume } from '../models/Resume';
import { type ParseJobData, QUEUE_NAMES } from '../queues';

interface ParseJobResult {
  resumeId: string;
  textLength: number;
}

function getMaxAttempts(job: Job<ParseJobData>): number {
  return job.opts.attempts ?? 1;
}

async function processParseJob(job: Job<ParseJobData>): Promise<ParseJobResult> {
  const { resumeId, filePath, fileType } = job.data;
  const currentAttempt = job.attemptsMade + 1;

  console.log(
    `[job ${job.id}] Attempt ${currentAttempt}/${getMaxAttempts(job)}: ` +
      `extracting ${fileType} text for resume ${resumeId}`,
  );

  const rawText = await extractText(filePath, fileType);

  const updated = await Resume.findByIdAndUpdate(resumeId, {
    rawText,
    status: 'parsed',
    error: null,
    attempts: currentAttempt,
  });

  if (!updated) {
    throw new Error(`Resume not found: ${resumeId}`);
  }

  return { resumeId, textLength: rawText.length };
}

async function markResumeFailed(job: Job<ParseJobData>, err: Error): Promise<void> {
  await Resume.findByIdAndUpdate(job.data.resumeId, {
    status: 'failed',
    error: err.message,
    attempts: job.attemptsMade,
  });
}

export function startParseWorker(): Worker<ParseJobData, ParseJobResult> {
  const worker = new Worker<ParseJobData, ParseJobResult>(QUEUE_NAMES.PARSE, processParseJob, {
    connection: redisConnectionOptions,
  });

  worker.on('completed', (job, result) => {
    console.log(`[job ${job.id}] Resume ${result.resumeId} parsed (${result.textLength} chars)`);
  });

  worker.on('failed', (job, err) => {
    if (!job) {
      console.error(`Job failed without job data: ${err.message}`);
      return;
    }

    const maxAttempts = getMaxAttempts(job);
    const isFinalAttempt = job.attemptsMade >= maxAttempts;
    const time = new Date().toISOString();

    if (!isFinalAttempt) {
      console.warn(
        `[${time}] [job ${job.id}] Attempt ${job.attemptsMade}/${maxAttempts} failed: ` +
          `${err.message}. Retrying with backoff...`,
      );
      return;
    }

    console.error(
      `[${time}] [job ${job.id}] Failed after ${maxAttempts} attempts: ${err.message}`,
    );

    markResumeFailed(job, err).catch((dbErr: unknown) => {
      const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.error(`Could not mark resume ${job.data.resumeId} as failed: ${message}`);
    });
  });

  return worker;
}