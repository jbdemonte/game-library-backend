import { mkdir, rmdir, rename, unlink } from 'fs/promises';
import * as p7zip from 'p7zip';
import { basename, extname, join, resolve } from 'path';
import { FileWatcher } from '../tools/file-watcher';
import { zipFile } from '../tools/zip';
import { getHashesFromFile } from './lib/get-hash';
import { getRomSystemId } from './lib/rom-system';
import { getFileList, getFileSize, moveFiles, replaceExtension } from '../tools/file';
import { romModel } from '../models/rom.model';
import { findRom } from './lib/find-rom';
import { getTmpFolder } from '../tools/tmp';
import { unique } from '../tools/array';
import { getSystemIds, getSystemsFromFile } from '../tools/systems';


export async function startDropZoneScan() {
  const dropZonePath = process.env.DROPZONE_PATH || '';
  if (!dropZonePath) {
    throw new Error('DROPZONE_PATH is empty');
  }
  await initDropZoneDirectories(dropZonePath);
  const watcher = new FileWatcher(dropZonePath, onFile);
  await watcher.start();
}

async function initDropZoneDirectories(dropZonePath: string) {
  const systemIds = getSystemIds();
  for (const systemId of systemIds) {
    await mkdir(join(dropZonePath, systemId), { recursive: true });
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
  if (!process.env.TMP_PATH) {
    throw new Error('tmp path is empty');
  }
  const tmpDir = join(resolve(process.env.TMP_PATH), getTmpFolder());
  await mkdir(tmpDir, { recursive: true });
  await p7zip.extract(path, tmpDir);
  const files = await getFileList(tmpDir);
  const systemIds = unique(files.map(file => {
    const systems = getSystemsFromFile(file);
    return systems.length > 1 ? '' : systems[0]?.id || ''; // keep only one system
  }));
  if (systemIds.length === 1 && systemIds[0] !== '') {
    await moveFiles(files, process.env.DROPZONE_PATH || '');
    await rmdir(tmpDir);
    await unlink(path);
  } else {
    await rmdir(tmpDir, { recursive: true });
    throw new Error(`7z archive contains more than one type of file: ${basename(path)}`);
  }
}

async function handleFile(path: string) {
  const hashes = await getHashesFromFile(path);
  let rom = await findRom(hashes);
  if (rom) {
    console.log(`already existing, deleting ${basename(path)}`);
    await unlink(path);
  } else {
    const system = getRomSystemId(path, hashes);
    if (!system) {
      throw new Error(`System not found for file ${path}`);
    }
    console.log(`new rom for ${system} : ${basename(path)}`);
    rom = new romModel({...hashes, system});
    rom.path = await saveRomFile(path, process.env.ROMS_PATH || '', system, rom.id);
    rom.size = await getFileSize(join(process.env.ROMS_PATH || '', rom.path));
    await rom.save();
  }
}

async function saveRomFile(source: string, targetPath: string, system: string, id: string): Promise<string> {
  if (!targetPath) {
    throw new Error('target path is missing');
  }
  await mkdir(join(targetPath, system, id), { recursive: true });
  let fileName = basename(source);
  const relativePath = join(system, id);
  if (extname(source) === '.zip') {
    await rename(source, join(targetPath, relativePath, fileName));
  } else {
    console.log(`compressing ${fileName}`);
    fileName = replaceExtension(fileName, 'zip');
    await zipFile(source, join(targetPath, relativePath, fileName));
    await unlink(source);
  }
  return join(relativePath, fileName);
}
