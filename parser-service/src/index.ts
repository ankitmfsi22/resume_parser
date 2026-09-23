import { env } from './config/env';

import {
  assertTopology,
  closeRabbit,
  connectMongo,
  connectRabbit,
  disconnectMongo,
} from '@resume-parser/shared';
import { startParseWorker } from './workers/parse.worker';

async function start(): Promise<void> {
  await connectMongo(env.MONGO_URI);

  const channel = await connectRabbit(env.RABBITMQ_URL);
  await assertTopology(channel);

  await startParseWorker();
  console.log(`Parser service started [${env.NODE_ENV}]`);

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
