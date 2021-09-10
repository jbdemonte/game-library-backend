import { readdir } from 'fs/promises';
import { join, resolve } from 'path';

export async function getNoIntroDataPath(parentPath: string): Promise<string | undefined> {
  const entries = await readdir(parentPath, { withFileTypes: true });

  return entries
    .filter(file => file.isDirectory() && file.name.match(/^No-Intro.*PC XML/))
    .map(file => resolve(join(parentPath, file.name)))
    .pop();
}
