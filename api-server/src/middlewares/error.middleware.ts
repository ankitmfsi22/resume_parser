import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { deleteFiles } from '../utils/file.util';

interface DuplicateKeyError {
  code: 11000;
  keyValue: Record<string, unknown>;
}

function isDuplicateKeyError(err: unknown): err is DuplicateKeyError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 11000
  );
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export async function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined;
  if (files?.length) {
    await deleteFiles(files.map((f) => f.path));
  }

  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown = null;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    const multerMessages: Partial<Record<multer.ErrorCode, string>> = {
      LIMIT_FILE_SIZE: `File too large. Maximum size is ${env.MAX_FILE_SIZE_MB} MB`,
      LIMIT_FILE_COUNT: `Too many files. Maximum is ${env.MAX_FILES_PER_UPLOAD} per upload`,
      LIMIT_UNEXPECTED_FILE: 'Unexpected field. Use form field name "resumes"',
    };
    message = multerMessages[err.code] ?? `Upload error: ${err.message}`;
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${String(err.value)}`;
  } else if (isDuplicateKeyError(err)) {
    statusCode = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`;
  }

  if (statusCode >= 500) {
    console.error('Server error:', err);
  }

  const stack = err instanceof Error ? err.stack : undefined;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack } : {}),
    },
  });
}
