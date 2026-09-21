import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import type { FileType } from '../models/Resume';

const MIME_TO_TYPE: Record<string, FileType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'image',
  'image/png': 'image',
};

export function ensureUploadDir(): string {
  const dir = path.resolve(env.UPLOAD_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created upload directory: ${dir}`);
  }
  return dir;
}

export function getFileType(mimetype: string): FileType | null {
  return MIME_TO_TYPE[mimetype] ?? null;
}

export async function deleteFiles(filePaths: string[]): Promise<void> {
  await Promise.all(
    filePaths.map(async (p) => {
      try {
        await fs.promises.unlink(p);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.log(`Could not delete ${p}: ${message}`);
      }
    }),
  );
}
