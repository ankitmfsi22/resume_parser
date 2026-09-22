import { env } from './config/env';

import { connectMongo, disconnectMongo } from './config/db';
import { insightsQueue, ocrQueue } from './queues';
import { startParseWorker } from './workers/parse.worker';

async function start(): Promise<void> {
  await connectMongo();

  const worker = startParseWorker();
  console.log(`Parser service started [${env.NODE_ENV}], waiting for jobs on parse-queue`);

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received, shutting down...`);
    await worker.close();
    await Promise.all([ocrQueue.close(), insightsQueue.close()]);
    await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void start();
