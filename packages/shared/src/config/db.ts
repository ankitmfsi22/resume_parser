import mongoose from 'mongoose';

export async function connectMongo(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('MongoDB connection failed:', message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err: Error) => console.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}