import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
export { getFileType } from '@resume-parser/shared';

export function ensureUploadDir(): string {
  const dir = path.resolve(env.UPLOAD_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created upload directory: ${dir}`);
  }
  return dir;
}
export async function deleteFiles(filePaths: string[]): Promise<void> {
  await Promise.all(
    filePaths.map(async (p) => {
      try {
        await fs.promises.unlink(p);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Could not delete ${p}: ${message}`);
      }
    }),
  );
}
