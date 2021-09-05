import fs from 'fs';
import { basename, join } from 'path';
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
  let rom = await findRom(fileHashes);
  if (rom) {
    console.log(`already existing, deleting ${basename(fileHashes.path)}`);
    await fs.promises.unlink(fileHashes.path);
  } else {
    const system = getRomSystemId(fileHashes);
    if (!system) {
      throw new Error(`System not found for file ${fileHashes.path}`);
    }
    console.log(`new rom for ${system} : ${basename(fileHashes.path)}`);
    rom = new romModel({...fileHashes, size, system});
    rom.path = await moveFile(fileHashes.path, process.env.ROMS_PATH || '', system, rom.id);
    await rom.save();
  }
}

async function moveFile(source: string, targetPath: string, system: string, id: string): Promise<string> {
  if (!targetPath) {
    throw new Error('target path is missing');
  }
  await fs.promises.mkdir(join(targetPath, system, id), { recursive: true });
  const relativePath = join(system, id, basename(source));
  await fs.promises.rename(source, join(targetPath, relativePath));
  return relativePath;
}
