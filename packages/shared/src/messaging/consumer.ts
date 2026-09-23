import type { Channel, ConsumeMessage } from 'amqplib';
import {
  EXCHANGES,
  MAX_ATTEMPTS,
  failedQueueName,
  getRetryDelayMs,
  retryQueueName,
} from './constants';

export interface JobContext {
  attempt: number;
  maxAttempts: number;
}

export interface ConsumerOptions<T> {
  channel: Channel;
  queue: string;
  handler: (data: T, ctx: JobContext) => Promise<void>;
  onFinalFailure?: (data: T, error: Error, attempts: number) => Promise<void>;
  maxAttempts?: number;
}

export async function startConsumer<T>(options: ConsumerOptions<T>): Promise<void> {
  const { channel, queue, handler, onFinalFailure, maxAttempts = MAX_ATTEMPTS } = options;

  async function handleMessage(msg: ConsumeMessage): Promise<void> {
    let data: T;

    try {
      data = JSON.parse(msg.content.toString()) as T;
    } catch {
      console.error(`[${queue}] Dropping message with invalid JSON`);
      channel.ack(msg);
      return;
    }

    const attempt = Number(msg.properties.headers?.['x-attempt'] ?? 1);
    const time = new Date().toISOString();

    try {
      await handler(data, { attempt, maxAttempts });
      channel.ack(msg);
      return;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxAttempts) {
        const delayMs = getRetryDelayMs(attempt);

        channel.publish(EXCHANGES.RETRY, retryQueueName(queue, delayMs), msg.content, {
          persistent: true,
          contentType: 'application/json',
          headers: { 'x-attempt': attempt + 1 },
        });
        channel.ack(msg);

        console.warn(
          `[${time}] [${queue}] Attempt ${attempt}/${maxAttempts} failed: ` +
            `${error.message}. Retrying in ${delayMs}ms...`,
        );
        return;
      }
      channel.sendToQueue(failedQueueName(queue), msg.content, {
        persistent: true,
        contentType: 'application/json',
        headers: { 'x-attempt': attempt, 'x-error': error.message },
      });
      channel.ack(msg);

      console.error(
        `[${time}] [${queue}] Failed after ${maxAttempts} attempts: ${error.message}`,
      );

      if (onFinalFailure) {
        await onFinalFailure(data, error, attempt).catch((dbErr: unknown) => {
          const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
          console.error(`[${queue}] onFinalFailure handler failed: ${message}`);
        });
      }
    }
  }

  await channel.consume(
    queue,
    (msg) => {
      if (msg) void handleMessage(msg);
    },
    { noAck: false },
  );

  console.log(`Consuming ${queue} (max ${maxAttempts} attempts)`);
}