import type { FileType } from '@resume-parser/shared';
import { extractDocxText } from './docx.extractor';
import { extractPdfText } from './pdf.extractor';

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractText(filePath: string, fileType: FileType): Promise<string> {
  switch (fileType) {
    case 'pdf':
      return normalizeText(await extractPdfText(filePath));

    case 'docx':
      return normalizeText(await extractDocxText(filePath));

    case 'image':
      throw new Error('Image resumes require OCR, which is not implemented yet');

    default: {
      const unhandled: never = fileType;
      throw new Error(`Unsupported file type: ${String(unhandled)}`);
    }
  }
}
