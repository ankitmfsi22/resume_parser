import amqp from 'amqplib';
import type { Channel } from 'amqplib';

type RabbitConnection = Awaited<ReturnType<typeof amqp.connect>>;
let connection: RabbitConnection | null = null;
let channel: Channel | null = null;

export async function connectRabbit(url: string): Promise<Channel> {
  try {
    connection = await amqp.connect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('RabbitMQ connection failed:', message);
    process.exit(1);
  }
  connection.on('error', (err: Error) => console.error('RabbitMQ error:', err.message));
  connection.on('close', () => {
    console.error('RabbitMQ connection closed, exiting');
    process.exit(1);
  });
  channel = await connection.createChannel();
  await channel.prefetch(1);
  console.log('RabbitMQ connected');
  return channel;
}

export function getChannel(): Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialised. Call connectRabbit() first.');
  }
  return channel;
}
export function isRabbitConnected(): boolean {
  return channel !== null;
}
export async function closeRabbit(): Promise<void> {
  await channel?.close();
  await connection?.close();
  channel = null;
  connection = null;
}