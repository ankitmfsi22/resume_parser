import mongoose from 'mongoose';
import { env } from './env';

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('MongoDB connection failed:', message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err: Error) => console.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}
