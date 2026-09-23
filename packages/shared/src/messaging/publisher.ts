import type { Channel } from 'amqplib';
import { EXCHANGES } from './constants';

export function publishJob<T>(
  channel: Channel,
  routingKey: string,
  data: T,
  attempt = 1,
): boolean {
  return channel.publish(EXCHANGES.WORK, routingKey, Buffer.from(JSON.stringify(data)), {
    persistent: true,
    contentType: 'application/json',
    headers: { 'x-attempt': attempt },
  });
}