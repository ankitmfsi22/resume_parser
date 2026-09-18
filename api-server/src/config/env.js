import 'dotenv/config';

function required(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,

  mongoUri: required('MONGO_URI'),
  redisUrl: required('REDIS_URL'),

  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024,
  maxFilesPerUpload: Number(process.env.MAX_FILES_PER_UPLOAD || 10),

  corsOrigin: process.env.CORS_ORIGIN || '*',
};