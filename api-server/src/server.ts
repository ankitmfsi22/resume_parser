import { env } from './config/env';
import app from './app';
import { connectMongo, disconnectMongo } from './config/db';
import { pingRedis, redisClient } from './config/redis';
import { parseQueue } from './queues';
import { ensureUploadDir } from './utils/file.util';

async function start(): Promise<void> {
  await connectMongo();

  if (!(await pingRedis())) {
    console.error('Redis ping failed');
    process.exit(1);
  }

  ensureUploadDir();

  const server = app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await parseQueue.close();
      await disconnectMongo();
      redisClient.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

void start();
