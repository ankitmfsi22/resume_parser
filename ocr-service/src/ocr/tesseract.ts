import { env } from '../config/env';
import { runCommand } from './runCommand';

export async function imageToText(imagePath: string): Promise<string> {
  return runCommand('tesseract', [imagePath, 'stdout', '-l', env.OCR_LANGUAGE]);
}