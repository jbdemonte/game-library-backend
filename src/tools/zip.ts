import { basename } from 'path';
import fs from 'fs';
import yazl from 'yazl';
import yauzl  from 'yauzl';
import { hashStream } from './hash-stream';
import { getHeaderRemoverTransform } from '../headers/get-header-remover-transform';
import { IFileHash } from '../interfaces/file-hash.interface';


export async function hashZipContent(path: string): Promise<IFileHash[]> {
  return new Promise((resolve, reject) => {
    const files: IFileHash[] = [];
    let hashing = false;
    let ended = false;

    yauzl.open(path, { lazyEntries: true }, function (err, zip) {
      if (err || !zip) {
        return reject(err || new Error('Unknown error opening zip file'));
      }
      const syncEnd = () => {
        if (ended && !hashing) {
          resolve(files);
        }
      }
      const readNext = () => zip.readEntry();

      zip.on('entry', function (entry) {
        if (/\/$/.test(entry.fileName)) {
          // directory
          readNext();
        } else {
          // file entry
          hashing = true;
          zip.openReadStream(entry, async function (err, readStream) {
            if (err || !readStream) {
              hashing = false;
              return reject(err || new Error('Unknown error reading zip file'));
            }
            readStream.on('end', readNext);
            files.push({
              name: entry.fileName,
              ...await hashStream(readStream, getHeaderRemoverTransform(entry.fileName)),
            });
            hashing = false;
            syncEnd();
          });
        }
      });

      zip.once('end', function() {
        ended = true;
        syncEnd();
      });

      readNext();
    });

  });
}

export function zipFile(sourceFile: string, targetFile: string): Promise<void> {
  const zipFile = new yazl.ZipFile();

  const fileName = basename(sourceFile);

  zipFile.addFile(sourceFile, fileName);

  zipFile.end();

  return new Promise((resolve, reject) => {
    zipFile
      .outputStream
      .pipe(fs.createWriteStream(targetFile))
      .on('close', () => resolve())
      .on('error', reject);
  });
}
