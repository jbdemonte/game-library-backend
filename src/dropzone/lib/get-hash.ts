import { createReadStream } from 'fs';
import { basename } from 'path';
import { hashStream } from '../../tools/hash-stream';
import { hashZipContent } from '../../tools/zip';
import { IFileHash } from './file-hash.interface';

export async function getHashFileFromFile(path: string): Promise<IFileHash> {
  return {
    path,
    files: [
      {
        name: basename(path),
        ...await hashStream(createReadStream(path))
      }
    ]
  };
}

export async function getHashFileFromZipFile(path: string): Promise<IFileHash> {
  return {
    path,
    files: await hashZipContent(path),
    zip: true
  }
}
