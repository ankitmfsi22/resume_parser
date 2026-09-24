import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { runCommand } from './runCommand';

export async function pdfToImages(pdfPath: string, outputDir: string): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });
  const prefix = path.join(outputDir, 'page');
  await runCommand('pdftoppm', [
    '-png',
    '-r',
    String(env.OCR_DPI),
    pdfPath,
    prefix,
  ]);
  const files = await fs.readdir(outputDir);
  return files
    .filter((file) => file.endsWith('.png'))
    .sort(comparePageNumbers)
    .map((file) => path.join(outputDir, file));
}
export function comparePageNumbers(a: string, b: string): number {
  return getPageNumber(a) - getPageNumber(b);
}

function getPageNumber(fileName: string): number {
  const match = /-(\d+)\.png$/.exec(fileName);
  return match ? Number(match[1]) : 0;
}