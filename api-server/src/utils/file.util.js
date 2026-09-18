import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

export function ensureUploadDir() {
  const dir = path.resolve(config.uploadDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created upload directory: ${dir}`);
  }
  return dir;
}

export function getFileType(mimetype) {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'docx';
  }
  if (['image/jpeg', 'image/png'].includes(mimetype)) return 'image';
  return null;
}

export async function deleteFiles(filePaths = []) {
  await Promise.all(
    filePaths.map(async (p) => {
      try {
        await fs.promises.unlink(p);
      } catch (err) {
        console.warn(`Could not delete ${p}: ${err.message}`);
      }
    })
  );
}