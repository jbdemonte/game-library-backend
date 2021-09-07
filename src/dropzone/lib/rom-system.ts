import { IFileHash } from './file-hash.interface';
import { getSystemsFromFileFolder, getSystemsFromFiles } from '../../tools/systems';

export function getRomSystemId(path: string, hashes: IFileHash[]): string {
  const systems = getSystemsFromFiles(hashes.map(hash => hash.name));
  if (systems.length === 1) {
    return systems[0].id;
  }
  const system = getSystemsFromFileFolder(path);
  if (system) {
    return system.id;
  }
  return '';
}
