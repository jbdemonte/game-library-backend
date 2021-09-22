// https://wiki.nesdev.com/w/index.php/NES_2.0
import { Transform, TransformCallback } from 'stream';

export class NesHeaderRemover extends Transform {
  private firstChunk = true;

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    if (chunk && this.firstChunk) {
      this.firstChunk = false;
      // iNES magic number: NES<EOF>
      if (Buffer.from([0x4e, 0x45, 0x53, 0x1a]).equals(chunk.slice(0, 4))) {
        chunk = chunk.slice(16);
      }
    }
    callback(null, chunk);
  }
}
