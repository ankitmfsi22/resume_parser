import app from './app.js';
import { config } from './config/env.js';
import { connectMongo, disconnectMongo } from './config/db.js';
import { redisConnection, pingRedis } from './config/redis.js';
import { ensureUploadDir } from './utils/file.util.js';

async function start() {
  await connectMongo();

  const redisOk = await pingRedis();
  if (!redisOk) {
    console.error(' Redis ping failed');
    process.exit(1);
  }

  ensureUploadDir();

  const server = app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port} [${config.nodeEnv}]`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectMongo();
      redisConnection.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT')); 
  process.on('SIGTERM', () => shutdown('SIGTERM')); 
}

start();