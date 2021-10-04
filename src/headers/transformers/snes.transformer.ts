import { Transform, TransformCallback } from 'stream';

/*
Take the size in bytes, divide by 1024 and take the remainder.

If the remainder is zero, its a headerless ROM
If the remainder is 512, this ROM has a header
Else, the rom is wrong.
*/

export class SNesTransformer extends Transform {
  private remove = 512;
  private len = 0;

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    if (chunk) {
      this.len += chunk.length;
      if (this.remove) {
        const offset = Math.min(chunk.length, this.remove);
        this.remove -= offset;
        chunk = chunk.slice(offset);
      }
    }
    callback(null, chunk);
  }

  _flush(callback:TransformCallback) {
    if ((this.len % 1024) !== 512) {
      this.emit('ignore-hash');
    } else {
      callback();
    }
  }
}
