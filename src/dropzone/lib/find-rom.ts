import { IFileHash } from '../../interfaces/file-hash.interface';
import { RomDocument, romModel } from '../../models/rom.model';

function hasMD5(target: Array<{ md5: string}>, md5: string): boolean {
  return target.some(item => item.md5 === md5);
}

function hasSameMD5s(source: Array<{ md5: string}>, target: Array<{ md5: string}>): boolean {
  if (source.length !== target.length) {
    return false;
  }
  return source.every(item => hasMD5(target, item.md5))
}

export async function findRom(hashes: IFileHash[]): Promise<RomDocument | undefined> {
  const roms = await romModel.find({ 'files.md5': hashes[0].md5 });
  if (roms.length) {
    return roms.find(rom => hasSameMD5s(rom.files, hashes));
  }
}
