import yauzl  from 'yauzl';
import { hashStream, IHashes } from './hash-stream';

export interface IFileHashes extends IHashes {
  name: string;
}

export function isZip(path: string): boolean {
  return Boolean(path.match(/\.zip$/i));
}

export async function hashZipContent(path: string): Promise<IFileHashes[]> {
  return new Promise((resolve, reject) => {
    const files: IFileHashes[] = [];
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
              ...await hashStream(readStream)
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
