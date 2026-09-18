import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectMongo() {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); 
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });
}

export async function disconnectMongo() {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}