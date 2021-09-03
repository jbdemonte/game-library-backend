import { Transform, TransformCallback, TransformOptions } from 'stream';

// Based on https://github.com/emn178/js-crc/blob/master/src/crc.js

export class CRC32Stream extends Transform {
  private size = 0;
  private table: number[] = [];
  private crc = -1;

  constructor(options?: TransformOptions) {
    super(options);
    const polynom = 0xEDB88320;

    for (let j = 0; j < 256; ++j) {
      let b = j;
      for (let k = 0; k < 8; ++k) {
        b = b & 1 ? polynom ^ (b >>> 1) : b >>> 1;
      }
      this.table[j] = b >>> 0;
    }
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    if (chunk) {
      for (let i = 0; i < chunk.length; i++) {
        this.crc = this.table[(this.crc ^ chunk[i]) & 0xFF] ^ (this.crc >>> 8);
      }
      this.size += chunk.length;
    }
    callback();
  }

  read() {
    return this.crc ^ -1;
  }

  toString(radix: number = 16) {
    return this.read().toString(radix);
  }

  dataSize() {
    return this.size;
  }
}
