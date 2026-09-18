import IORedis from 'ioredis';
import { config } from './env.js';

export const redisConnection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => console.log('Redis connected'));
redisConnection.on('error', (err) => console.error('Redis error:', err.message));

export async function pingRedis() {
  const pong = await redisConnection.ping();
  return pong === 'PONG';
}