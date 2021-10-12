import systems from '../data/systems.json';

export function isSystemId(systemId: string) {
  return systems.some(system => system.id === systemId);
}
