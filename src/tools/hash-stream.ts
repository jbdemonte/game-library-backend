import { Readable, PassThrough, Transform } from 'stream';
import crypto from 'crypto';
import { CRC32Stream } from './crc32';
import { IFileHash } from '../interfaces/file-hash.interface';

type IHashes = Omit<IFileHash, 'name'>;

export function hashStream<T extends Transform>(stream: Readable, headerRemover?: T | undefined): Promise<IHashes> {
  return new Promise((resolve) => {
    const result: IHashes = {
      crc: '',
      md5: '',
      size: 0,
    };

    function resolveIfComplete() {
      if (result.md5 && result.crc && result.size && (!headerRemover || result.generic)) {
        resolve(result);
      }
    }

    // http://www.throrinstudio.com/dev/web/use-the-same-stream-multiple-times/#respond
    const copyStream1 = new PassThrough();
    const copyStream2 = new PassThrough();

    stream.pipe(copyStream1);
    stream.pipe(copyStream2);

    const md5Hash = crypto.createHash('md5');
    const crc32 = new CRC32Stream();

    md5Hash.once('readable', () => {
      result.md5 = md5Hash.read().toString('hex');
      resolveIfComplete();
    });

    crc32.once('readable', () => {
      result.crc = crc32.toString();
      result.size = crc32.dataSize();
      resolveIfComplete();
    });

    copyStream1.pipe(md5Hash);
    copyStream2.pipe(crc32);

    if (headerRemover) {
      stream.pipe(headerRemover);
      hashStream(headerRemover)
        .then(hash => {
          result.generic = {
            crc: hash.crc,
            md5: hash.md5,
            size: hash.size,
          }
          resolveIfComplete();
        })
        .catch(err => {
          throw err;
        });
    }
  });
}
