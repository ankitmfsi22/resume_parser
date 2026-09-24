import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import type { FileType } from '@resume-parser/shared';
import { env } from '../config/env';
import { pdfToImages } from './pdfToImages';
import { imageToText } from './tesseract';

export function normalizeOcrText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
export function combinePageTexts(pageTexts: string[]): string {
  return pageTexts.map((t) => t.trim()).filter(Boolean).join('\n\n');
}
async function createTempDir(): Promise<string> {
  const base = path.resolve(env.OCR_TEMP_DIR);
  await fs.mkdir(base, { recursive: true });
  return fs.mkdtemp(path.join(base, 'ocr-'));
}

async function removeTempDir(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Could not clean up ${dir}: ${message}`);
  }
}

export interface OcrResult {
  text: string;
  pages: number;
}

export async function extractTextWithOcr(
  filePath: string,
  fileType: FileType,
): Promise<OcrResult> {
  if (fileType === 'image') {
    const text = await imageToText(filePath);
    return { text: normalizeOcrText(text), pages: 1 };
  }

  if (fileType !== 'pdf') {
    throw new Error(`OCR does not support file type: ${fileType}`);
  }
  const tempDir = await createTempDir();
  try {
    const imagePaths = await pdfToImages(filePath, tempDir);
    if (imagePaths.length === 0) {
      throw new Error('PDF produced no pages to OCR');
    }
    console.log(`Converted PDF into ${imagePaths.length} page images`);
    const pageTexts: string[] = [];
    for (const [index, imagePath] of imagePaths.entries()) {
      const pageText = await imageToText(imagePath);
      console.log(`Page ${index + 1}/${imagePaths.length}: ${pageText.trim().length} chars`);
      pageTexts.push(pageText);
    }
    return {
      text: normalizeOcrText(combinePageTexts(pageTexts)),
      pages: imagePaths.length,
    };
  } finally {
    await removeTempDir(tempDir);
  }
}