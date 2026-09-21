import path from 'path';
import { Resume } from '../models/Resume';
import { parseQueue } from '../queues';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { getFileType } from '../utils/file.util';

export const uploadResumeFiles = asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  if (files.length === 0) {
    throw ApiError.badRequest('No files uploaded. Use form field "resumes".');
  }

  const docs = files.map((file) => {
    const fileType = getFileType(file.mimetype);
    if (!fileType) {
      throw ApiError.badRequest(`Unsupported file: ${file.originalname}`);
    }

    return {
      fileName: file.originalname,
      storedFileName: file.filename,
      filePath: path.resolve(file.path),
      fileType,
      fileSize: file.size,
      status: 'uploaded' as const,
    };
  });

  const created = await Resume.insertMany(docs).catch(() => {
    throw ApiError.internal('Failed to save resume records');
  });

  try {
    await parseQueue.addBulk(
      created.map((resume) => ({
        name: 'parse-resume',
        data: {
          resumeId: resume._id.toString(),
          filePath: resume.filePath,
          fileType: resume.fileType,
        },
      })),
    );
  } catch {
    await Resume.deleteMany({ _id: { $in: created.map((r) => r._id) } });
    throw ApiError.internal('Failed to queue resumes for processing');
  }

  res.status(202).json({
    success: true,
    message: `${created.length} resume(s) uploaded and queued for processing`,
    data: created.map((r) => ({
      id: r._id,
      fileName: r.fileName,
      fileType: r.fileType,
      status: r.status,
      createdAt: r.createdAt,
    })),
  });
});
