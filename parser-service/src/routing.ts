import type { FileType } from "@resume-parser/shared";
export const MIN_TEXT_LENGTH = 50;

export function requiresOcrBeforeExtraction(fileType: FileType): boolean {
  return fileType === 'image';
}
export function hasEnoughText(text: string): boolean {
  return text.trim().length >= MIN_TEXT_LENGTH;
}