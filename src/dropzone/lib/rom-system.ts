import { IFileHash } from './file-hash.interface';
import { getSystemsFromFileFolder, getSystemsFromFiles } from '../../tools/systems';

export function getRomSystemId(fileHashes: IFileHash): string {
  const systems = getSystemsFromFiles(fileHashes.files.map(hash => hash.name));
  if (systems.length === 1) {
    return systems[0].id;
  }
  const system = getSystemsFromFileFolder(fileHashes.path);
  if (system) {
    return system.id;
  }
  return '';
}
