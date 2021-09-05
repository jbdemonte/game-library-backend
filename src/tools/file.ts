import { stat } from 'fs/promises';

export async function getFileSize(path: string) {
  const stats = await stat(path);
  return stats.size;
}


export function replaceExtension(path: string, extension: string): string {
  return path.replace(/\.[^.]+$/, `.${extension}`);
}
