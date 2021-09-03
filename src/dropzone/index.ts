import { FileWatcher } from '../tools/file-watcher';
import { createReadStream } from 'fs';
import { hashStream } from '../tools/hash-stream';
import { hashZipContent, isZip } from '../tools/zip';
import { basename } from 'path';

export interface IFileHash {
  path: string;
  hashes: Array<{
    name: string;
    crc: string;
    md5: string;
    length: number;
  }>
  zip?: true;
}

async function getHashFileFromFile(path: string): Promise<IFileHash> {
  return {
    path,
    hashes: [
      {
        name: basename(path),
        ...await hashStream(createReadStream(path))
      }
    ]
  };
}

async function getHashFileFromZipFile(path: string): Promise<IFileHash> {
  return {
    path,
    hashes: await hashZipContent(path),
    zip: true
  }
}

async function onFile(path: string) {
  let fileHashes: IFileHash;
  if (isZip(path)) {
    fileHashes = await getHashFileFromZipFile(path);
  } else {
    fileHashes = await getHashFileFromFile(path);
  }
  console.log(fileHashes);
}

export async function startDropZoneScan() {
  const watcher = new FileWatcher(process.env.DROPZONE_PATH || '', onFile);
  await watcher.start();
}
