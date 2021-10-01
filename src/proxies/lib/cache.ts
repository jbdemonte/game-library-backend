import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { getTempPath } from '../../config';
import { IProxy } from '../../interfaces/proxy.interface';

const tmpFilePath = join(getTempPath(), 'proxies.json');

export async function saveToTmp(proxies: IProxy[]) {
  await mkdir(dirname(tmpFilePath), { recursive: true });
  await writeFile(tmpFilePath, JSON.stringify(proxies, null, 2));
}

export async function loadFromTmp() {
  try {
    const buffer = await readFile(tmpFilePath);
    return JSON.parse(buffer.toString());
  } catch (err) {
    return [];
  }
}
