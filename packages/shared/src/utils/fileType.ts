import type { FileType } from '../models/Resume';

const MIME_TO_TYPE: Record<string, FileType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'image',
  'image/png': 'image',
};

export function getFileType(mimetype: string): FileType | null {
  return MIME_TO_TYPE[mimetype] ?? null;
}