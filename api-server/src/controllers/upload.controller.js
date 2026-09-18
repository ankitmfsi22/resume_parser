import { Resume } from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteFiles } from '../utils/file.util.js';

export const uploadResumeFiles = asyncHandler(async (req, res) => {
  const files = req.files || [];

  if (files.length === 0) {
    throw ApiError.badRequest('No files uploaded. Use form field "resumes".');
  }

  const docs = files.map((file) => ({
    fileName: file.originalname,
    storedFileName: file.filename,
    filePath: file.path,
    fileType: file.resolvedType,
    fileSize: file.size,
    status: 'uploaded',
  }));

  let created;
  try {
    created = await Resume.insertMany(docs);
  } catch (err) {
    await deleteFiles(files.map((f) => f.path));
    throw ApiError.internal('Failed to save resume records');
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