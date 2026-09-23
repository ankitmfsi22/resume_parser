import type { Channel } from 'amqplib';
import {
  EXCHANGES,
  QUEUES,
  ROUTING_KEYS,
  RETRY_DELAYS_MS,
  failedQueueName,
  retryQueueName,
} from './constants';

async function assertWorkQueue(channel: Channel, queue: string, routingKey: string): Promise<void> {
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, EXCHANGES.WORK, routingKey);
  for (const delayMs of RETRY_DELAYS_MS) {
    const name = retryQueueName(queue, delayMs);
    await channel.assertQueue(name, {
      durable: true,
      messageTtl: delayMs,
      deadLetterExchange: EXCHANGES.WORK,
      deadLetterRoutingKey: routingKey,
    });
    await channel.bindQueue(name, EXCHANGES.RETRY, name);
  }
  await channel.assertQueue(failedQueueName(queue), { durable: true });
}

export async function assertTopology(channel: Channel): Promise<void> {
  await channel.assertExchange(EXCHANGES.WORK, 'direct', { durable: true });
  await channel.assertExchange(EXCHANGES.RETRY, 'direct', { durable: true });

  await assertWorkQueue(channel, QUEUES.PARSE, ROUTING_KEYS.PARSE);
  await assertWorkQueue(channel, QUEUES.OCR, ROUTING_KEYS.OCR);
  await assertWorkQueue(channel, QUEUES.INSIGHTS, ROUTING_KEYS.INSIGHTS);

  console.log('RabbitMQ topology ready');
}