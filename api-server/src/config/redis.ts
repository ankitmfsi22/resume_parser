import IORedis from 'ioredis';
import { env } from './env';

const redisUrl = new URL(env.REDIS_URL);

export const redisConnectionOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  maxRetriesPerRequest: null,
};

export const redisClient = new IORedis(redisConnectionOptions);

redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (err: Error) => console.error('Redis error:', err.message));

export async function pingRedis(): Promise<boolean> {
  return (await redisClient.ping()) === 'PONG';
}
