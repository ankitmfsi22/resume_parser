import multer from 'multer';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { deleteFiles } from '../utils/file.util.js';

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export async function errorHandler(err, req, res, next) {
  
  if (req.files?.length) {
    await deleteFiles(req.files.map((f) => f.path));
  }

  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    const mb = config.maxFileSizeBytes / (1024 * 1024);

    const multerMessages = {
      LIMIT_FILE_SIZE: `File too large. Maximum size is ${mb} MB`,
      LIMIT_FILE_COUNT: `Too many files. Maximum is ${config.maxFilesPerUpload} per upload`,
      LIMIT_UNEXPECTED_FILE: 'Unexpected field. Use form field name "resumes"',
    };

    message = multerMessages[err.code] || `Upload error: ${err.message}`;
  }

  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }

  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  else if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`;
  }

  if (statusCode >= 500) {
    console.error('Server error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(config.nodeEnv === 'development' && statusCode >= 500 && { stack: err.stack }),
    },
  });
}