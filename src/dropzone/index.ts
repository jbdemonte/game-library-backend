import { FileWatcher } from '../tools/file-watcher';

async function onFile(path: string) {
  console.log('> ' + path)
}

export async function startDropZoneScan() {
  const watcher = new FileWatcher(process.env.DROPZONE_PATH || '', onFile);
  await watcher.start();
}
