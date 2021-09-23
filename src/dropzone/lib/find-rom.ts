import { IFileHash } from '../../interfaces/file-hash.interface';
import { RomDocument, romModel } from '../../models/rom.model';

function hasMD5(target: IFileHash[], md5: string): boolean {
  return target.some(item => item.md5 === md5 || item.unheadered?.md5 === md5);
}

function hasSameMD5s(source: IFileHash[], target: IFileHash[]): boolean {
  if (source.length !== target.length) {
    return false;
  }
  return source.every(item => hasMD5(target, item.md5) || (item.unheadered && hasMD5(target, item.unheadered.md5)))
}

export async function findRom(hashes: IFileHash[]): Promise<RomDocument | undefined> {
  const first = hashes[0];
  const md5 = [first.md5];
  if (first.unheadered) {
    md5.push(first.unheadered.md5)
  }
  const roms = await romModel.find({ $or: [{ 'files.md5': { $in: md5 } }, { 'files.unheadered.md5': { $in: md5 } }] });
  if (roms.length) {
    return roms.find(rom => hasSameMD5s(rom.files, hashes));
  }
}
