import { extname } from 'path';
import rawSystems from '../data/systems.json';

const systems = (rawSystems as ISystem[]);

export interface ISystem {
  id: string;
  name: string;
  type: 'arcade' | 'computer' | 'console' | 'handheld' | 'arcade-emulation' | 'console-arcade' | 'misc';
  extensions: string[];
  screenscraper: number;
  'no-intro'?: string;
}

function getSystemsFromExtension(extension: string): ISystem[] {
  return systems.filter(system => system.extensions.includes(extension));
}

export function getSystemsFromFile(name: string): ISystem[] {
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
  return systems.find(system => system.id === folder);
}

export function getSystemIds(): string[] {
  return systems.map(system => system.id);
}

export function getSystem(id: string): ISystem {
  const system = systems.find(system => system.id === id);
  if (!system) {
    throw new Error(`System not found for id ${id}`);
  }
  return system;
}
