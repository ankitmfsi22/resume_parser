import { env } from './config/env';
import {
  assertTopology,
  closeRabbit,
  connectMongo,
  connectRabbit,
  disconnectMongo,
} from '@resume-parser/shared';
import { startOcrWorker } from './workers/ocr.worker';
async function start(): Promise<void> {
  await connectMongo(env.MONGO_URI);
  const channel = await connectRabbit(env.RABBITMQ_URL);
  await assertTopology(channel);
  await startOcrWorker();
  console.log(`OCR service started [${env.NODE_ENV}], language: ${env.OCR_LANGUAGE}`);
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received, shutting down...`);
    await closeRabbit();
    await disconnectMongo();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}
void start();