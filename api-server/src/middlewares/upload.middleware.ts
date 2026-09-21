import crypto from 'crypto';
import path from 'path';
import type { Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { ensureUploadDir, getFileType } from '../utils/file.util';

const ALLOWED_EXTENSIONS: readonly string[] = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!getFileType(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    cb(
      ApiError.badRequest(
        `Unsupported file: ${file.originalname}. Allowed types: PDF, DOCX, JPG, PNG`,
      ),
    );
    return;
  }

  cb(null, true);
}

export const uploadResumes = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: env.MAX_FILES_PER_UPLOAD,
  },
}).array('resumes', env.MAX_FILES_PER_UPLOAD);
