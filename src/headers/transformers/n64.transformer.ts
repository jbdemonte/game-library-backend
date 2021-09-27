import { Transform, TransformCallback } from 'stream';

/*
https://www.reddit.com/r/emulation/comments/7hrvzp/the_three_different_n64_rom_formats_explained_for/
  For people who like to use No-Intro's databases to keep their rom names nice and neat, you should know that No-Intro only keeps dat files for Big Endian/.z64
  and Byte Swapped/.v64 files. However, their Byte Swapped files get called ".n64" instead of ".v64". Because of this, I don't recommend using Little Endian.

  http://n64dev.org/romformats.html

  https://krikzz.com/forum/index.php?topic=2920.15
*/

// CDAB => ABCD
function swapWords(buffer: Buffer) {
  for (let i = 0; i < buffer.length / 4; i++) {
    const pos = i * 4;
    let tmp = buffer[pos];
    buffer[pos] = buffer[pos + 2];
    buffer[pos + 2] = tmp;
    tmp = buffer[pos + 1];
    buffer[pos + 1] = buffer[pos + 3];
    buffer[pos + 3] = tmp;
  }
}

export class N64Transformer extends Transform {
  private firstChunk = true;
  private byteSwapped = false;
  private wordSwapped = false;
  private littleEndian = false;


  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    if (chunk && this.firstChunk) {
      this.firstChunk = false;
      const magicNumber = chunk.slice(0, 4);
      /*
      if (Buffer.from([0x80, 0x37, 0x12, 0x40]).equals(magicNumber)) {
        // native (big endian) .z64 image with header 0x80371240. [ABCD]
      } else */
      if (Buffer.from([0x40, 0x12, 0x37, 0x80]).equals(magicNumber)) {
        // little endian .n64 image with header 0x40123780. [DCBA]
        this.littleEndian = true;
      } else if (Buffer.from([0x37, 0x80, 0x40, 0x12]).equals(magicNumber)) {
        // byte swapped .v64 image with header 0x37804012. [BADC]
        this.byteSwapped = true;
      } else if (Buffer.from([0x12, 0x40, 0x80, 0x37]).equals(magicNumber)) {
        // word swapped .n64 image with header 0x12408037. [CDAB]
        this.wordSwapped = true;
      }
    }
    if (this.littleEndian) {
      chunk.swap32();
    } else if (this.byteSwapped) {
      chunk.swap16();
    } else if (this.wordSwapped) {
      swapWords(chunk);
    }
    callback(null, chunk);
  }
}
