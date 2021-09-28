import { mkdir, rmdir, rename, unlink } from 'fs/promises';
import * as p7zip from 'p7zip';
import { basename, extname, join, resolve } from 'path';
import { FileWatcher } from '../tools/file-watcher';
import { zipFile } from '../tools/zip';
import { getHashesFromFileContent, hashFile } from './lib/get-hash';
import { getRomSystemId } from './lib/rom-system';
import { getFileList, moveFiles, replaceExtension } from '../tools/file';
import { romModel } from '../models/rom.model';
import { findRom } from './lib/find-rom';
import { getTmpFolder } from '../tools/tmp';
import { unique } from '../tools/array';
import { getSystemIds, getSystemsFromFile } from '../tools/systems';
import { getDropzoneConfig } from '../config';

const config = getDropzoneConfig();

export async function startDropZoneScan() {
  await initDropZoneDirectories();
  const watcher = new FileWatcher(config.dropZone, onFile);
  await watcher.start();
}

async function initDropZoneDirectories() {
  const systemIds = getSystemIds();
  for (const systemId of systemIds) {
    await mkdir(join(config.dropZone, systemId), { recursive: true });
  }
}

async function onFile(path: string): Promise<void> {
  if (extname(path).toLowerCase() === '.7z') {
    return await handle7ZipFile(path);
  }
  await handleFile(path);
}

/*
  if all files contained in the archive have the same system, all files will be moved to the dropzone
  in order to get them processed as standalone files (merged 7z which contains multiple rom of the same game, on multiple versions)
  else, throw an error because of the ambiguous system detection
 */
async function handle7ZipFile(path: string) {
  const tmpDir = join(resolve(config.tmp), getTmpFolder());
  await mkdir(tmpDir, { recursive: true });
  await p7zip.extract(path, tmpDir);
  const files = await getFileList(tmpDir);
  const systemIds = unique(files.map(file => {
    const systems = getSystemsFromFile(file);
    return systems.length > 1 ? '' : systems[0]?.id || ''; // keep only one system
  }));
  if (systemIds.length === 1 && systemIds[0] !== '') {
    await moveFiles(files, config.dropZone);
    await rmdir(tmpDir);
    await unlink(path);
  } else {
    await rmdir(tmpDir, { recursive: true });
    throw new Error(`7z archive contains more than one type of file: ${basename(path)}`);
  }
}

async function handleFile(path: string): Promise<void> {
  const hashes = await getHashesFromFileContent(path);
  let rom = await findRom(hashes);
  if (rom) {
    console.log(`already existing, deleting ${basename(path)}`);
    return await unlink(path);
  }
  const system = getRomSystemId(path, hashes);
  if (!system) {
    throw new Error(`System not found for file ${path}`);
  }
  console.log(`new rom for ${system} : ${basename(path)}`);
  rom = new romModel({ system, files: hashes });
  const newPath = await saveRomFile(path, config.roms, system, rom.id);
  rom.archive = await hashFile(newPath);
  await rom.save();
}

async function saveRomFile(source: string, targetPath: string, system: string, id: string): Promise<string> {
  if (!targetPath) {
    throw new Error('target path is missing');
  }
  await mkdir(join(targetPath, system, id), { recursive: true });
  let fileName = basename(source);
  let targetFilePath = join(targetPath, system, id, fileName);

  if (extname(fileName) === '.zip') {
    await rename(source, targetFilePath);
  } else {
    console.log(`compressing ${fileName}`);
    targetFilePath = replaceExtension(targetFilePath, 'zip');
    await zipFile(source, targetFilePath);
    await unlink(source);
  }
  return targetFilePath;
}
