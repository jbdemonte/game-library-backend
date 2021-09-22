/**
 * Returns the dedicated stream transform to remove the rom header
 * https://docs.retroachievements.org/Game-Identification/
 */
import { extname } from 'path';
import { NesHeaderRemover } from './removers/nes-header-remover';

export function getHeaderRemoverTransform(file: string) {
  const extension = extname(file).toLowerCase();
  if (extension === '.nes') {
    return new NesHeaderRemover();
  }
}
