import fs from 'fs';
import { basename, join } from 'path';
import yazl from 'yazl';
import { FileWatcher } from '../tools/file-watcher';
import { isZip } from '../tools/zip';
import { IFileHash } from './lib/file-hash.interface';
import { getHashFileFromFile, getHashFileFromZipFile } from './lib/get-hash';
import { getRomSystemId } from './lib/rom-system';
import { getFileSize, replaceExtension } from '../tools/file';
import { romModel } from '../models/rom.model';
import { findRom } from './lib/find-rom';


export async function startDropZoneScan() {
  const watcher = new FileWatcher(process.env.DROPZONE_PATH || '', onFile);
  await watcher.start();
}

async function onFile(path: string) {
  let fileHashes: IFileHash;
  if (isZip(path)) {
    fileHashes = await getHashFileFromZipFile(path);
  } else {
    fileHashes = await getHashFileFromFile(path);
  }
  await handleFile(fileHashes);
}


async function handleFile(fileHashes: IFileHash) {
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
    rom = new romModel({...fileHashes, system});
    rom.path = await saveRomFile(fileHashes.path, process.env.ROMS_PATH || '', system, rom.id);
    rom.size = await getFileSize(join(process.env.ROMS_PATH || '', rom.path));
    await rom.save();
  }
}

function compressFile(sourceFile: string, targetFile: string): Promise<string> {
  const zipFile = new yazl.ZipFile();

  const fileName = basename(sourceFile);

  zipFile.addFile(sourceFile, fileName);

  // replace extension by .zip
  const zipName = fileName.replace(/\.[^.]+$/, '.zip');

  zipFile.end();

  return new Promise((resolve, reject) => {
    zipFile
      .outputStream
      .pipe(fs.createWriteStream(targetFile))
      .on('close', () => resolve(zipName))
      .on('error', reject);
  });
}

async function saveRomFile(source: string, targetPath: string, system: string, id: string): Promise<string> {
  if (!targetPath) {
    throw new Error('target path is missing');
  }
  await fs.promises.mkdir(join(targetPath, system, id), { recursive: true });
  let fileName = basename(source);
  const relativePath = join(system, id);
  if (isZip(source)) {
    await fs.promises.rename(source, join(targetPath, relativePath, fileName));
  } else {
    console.log(`compressing ${fileName}`);
    fileName = replaceExtension(fileName, 'zip');
    await compressFile(source, join(targetPath, relativePath, fileName));
  }
  return join(relativePath, fileName);
}
