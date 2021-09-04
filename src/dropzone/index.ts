import { createReadStream } from 'fs';
import { basename } from 'path';
import { FileWatcher } from '../tools/file-watcher';
import { hashStream } from '../tools/hash-stream';
import { hashZipContent, isZip } from '../tools/zip';
import { getSystemsFromFileFolder, getSystemsFromFiles } from '../tools/systems';

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

function getRomSystemId(fileHashes: IFileHash): string {
  const systems = getSystemsFromFiles(fileHashes.hashes.map(hash => hash.name));
  if (systems.length === 1) {
    return systems[0].id;
  }
  const system = getSystemsFromFileFolder(fileHashes.path);
  if (system) {
    return system.id;
  }
  return '';
}

async function onFile(path: string) {
  let fileHashes: IFileHash;
  if (isZip(path)) {
    fileHashes = await getHashFileFromZipFile(path);
  } else {
    fileHashes = await getHashFileFromFile(path);
  }
  console.log({
    ...fileHashes,
    system: getRomSystemId(fileHashes),
  });
}

export async function startDropZoneScan() {
  const watcher = new FileWatcher(process.env.DROPZONE_PATH || '', onFile);
  await watcher.start();
}
