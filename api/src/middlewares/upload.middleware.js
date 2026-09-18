import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { ensureUploadDir, getFileType } from '../utils/file.util.js';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const type = getFileType(file.mimetype);

  if (!type || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      ApiError.badRequest(
        `Unsupported file: ${file.originalname}. Allowed types: PDF, DOCX, JPG, PNG`
      )
    );
  }

  file.resolvedType = type; 
  cb(null, true);
};

export const uploadResumes = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeBytes,
    files: config.maxFilesPerUpload,
  },
}).array('resumes', config.maxFilesPerUpload);