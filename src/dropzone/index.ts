import { FileWatcher } from '../tools/file-watcher';
import { isZip } from '../tools/zip';
import { IFileHash } from './lib/file-hash.interface';
import { getHashFileFromFile, getHashFileFromZipFile } from './lib/get-hash';
import { getRomSystemId } from './lib/rom-system';
import { getFileSize } from '../tools/file';
import { romModel } from '../models/rom.model';
import { findRom } from './lib/find-rom';

export async function startDropZoneScan() {
  const watcher = new FileWatcher(process.env.DROPZONE_PATH || '', onFile);
  await watcher.start();
}

async function onFile(path: string) {
  let fileHashes: IFileHash;
  let size: number;
  if (isZip(path)) {
    fileHashes = await getHashFileFromZipFile(path);
    size = await getFileSize(path);
  } else {
    fileHashes = await getHashFileFromFile(path);
    size = fileHashes.files[0].size;
  }
  await handleFile(fileHashes, size);
}


async function handleFile(fileHashes: IFileHash, size: number) {
  const system = getRomSystemId(fileHashes);
  if (!system) {
    throw new Error(`System not found for file ${fileHashes.path}`);
  }
  let rom = await findRom(fileHashes);
  if (rom) {
    // already exists
  } else {
    rom = new romModel({...fileHashes, size, system});
    await rom.save();
  }
}
