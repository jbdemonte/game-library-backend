import { createReadStream } from 'fs';
import { basename, extname } from 'path';
import { hashStream } from '../../tools/hash-stream';
import { hashZipContent } from '../../tools/zip';
import { IFileHash } from '../../interfaces/file-hash.interface';
import { getGenericTransformer } from '../../headers/get-generic-transformer';

export async function getHashesFromFileContent(path: string): Promise<IFileHash[]> {
  if (extname(path).toLowerCase() === '.zip') {
    return await hashZipContent(path);
  }
  return [ await hashFile(path) ];
}


export async function hashFile(path: string): Promise<IFileHash> {
  return {
    name: basename(path),
  ...await hashStream(createReadStream(path), getGenericTransformer(path)),
  }
}
