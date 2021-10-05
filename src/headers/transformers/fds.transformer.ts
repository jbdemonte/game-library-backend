import { Transform, TransformCallback } from 'stream';

export class FdsTransformer extends Transform {
  private firstChunk = true;

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    if (chunk && this.firstChunk) {
      this.firstChunk = false;
      // magic number: FDS<EOF>
      if (Buffer.from([0x46, 0x44, 0x53, 0x1a]).equals(chunk.slice(0, 4))) {
        chunk = chunk.slice(16);
      }
    }
    callback(null, chunk);
  }
}
