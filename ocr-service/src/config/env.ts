import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),

  MONGO_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\/.+/, 'must start with mongodb:// or mongodb+srv://'),
  RABBITMQ_URL: z.string().regex(/^amqps?:\/\/.+/, 'must start with amqp:// or amqps://'),

  OCR_TEMP_DIR: z.string().min(1),
  OCR_LANGUAGE: z.string().min(2),
  OCR_DPI: z.coerce.number().int().min(72).max(600),
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