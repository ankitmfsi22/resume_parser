import { env } from './env';

const redisUrl = new URL(env.REDIS_URL);

export const redisConnectionOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  maxRetriesPerRequest: null,
};
