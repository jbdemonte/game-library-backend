import { extname } from 'path';
import systems from '../data/systems.json';

export interface ISystem {
  id: string;
  name: string;
  type: 'arcade' | 'computer' | 'console' | 'handheld' | 'arcade-emulation' | 'console-arcade' | 'misc';
  extensions: string[];
  screenscraper: number;
}

function getSystemsFromExtension(extension: string): ISystem[] {
  return (systems as ISystem[]).filter(system => system.extensions.includes(extension));
}

function getSystemsFromFile(name: string): ISystem[] {
  const extension = extname(name).substring(1).toLowerCase();
  return getSystemsFromExtension(extension);
}

export function getSystemsFromFiles(names: string[]): ISystem[] {
  const systemList = names.map(name => getSystemsFromFile(name)).flat();

  // remove duplicate
  return systemList.filter((system, index) => systemList.indexOf(system) === index);
}

export function getSystemsFromFileFolder(path: string): ISystem | undefined {
  const folder = path.split('/').slice(-2, -1).pop();
  return (systems as ISystem[]).find(system => system.id === folder);
}
