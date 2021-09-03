import { FileWatcher } from '../tools/file-watcher';
import { createReadStream } from 'fs';
import { hashStream } from '../tools/hash-stream';

async function onFile(path: string) {
  const hashes = await hashStream(createReadStream(path));
  console.log({
    path,
    ...hashes
  });
}

export async function startDropZoneScan() {
  const watcher = new FileWatcher(process.env.DROPZONE_PATH || '', onFile);
  await watcher.start();
}
