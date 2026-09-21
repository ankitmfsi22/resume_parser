import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().min(1).max(65535),

  MONGO_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\/.+/, 'must start with mongodb:// or mongodb+srv://'),
  REDIS_URL: z.string().regex(/^rediss?:\/\/.+/, 'must start with redis:// or rediss://'),

  UPLOAD_DIR: z.string().min(1),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().max(50),
  MAX_FILES_PER_UPLOAD: z.coerce.number().int().min(1).max(50),

  CORS_ORIGIN: z.string().url(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:');
  for (const issue of result.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = Object.freeze(result.data);
export type Env = typeof env;
