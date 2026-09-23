import { env } from './config/env';
import {
  assertTopology,
  closeRabbit,
  connectMongo,
  connectRabbit,
  disconnectMongo,
} from '@resume-parser/shared';
import app from './app';
import { ensureUploadDir } from './utils/file.util';

async function start(): Promise<void> {
  await connectMongo(env.MONGO_URI);
  const channel = await connectRabbit(env.RABBITMQ_URL);
  await assertTopology(channel);
  ensureUploadDir();
  const server = app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });
  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await closeRabbit();
      await disconnectMongo();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

void start();
