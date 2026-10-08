import { env } from './config/env';
import {
  assertTopology,
  closeRabbit,
  connectMongo,
  connectRabbit,
  disconnectMongo,
} from '@resume-parser/shared';
import { startInsightsWorker } from './workers/insights.worker';

async function start(): Promise<void> {
  await connectMongo(env.MONGO_URI);
  const channel = await connectRabbit(env.RABBITMQ_URL);
  await assertTopology(channel);
  await startInsightsWorker();
  console.log(`Insights worker started [${env.NODE_ENV}]`);
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
