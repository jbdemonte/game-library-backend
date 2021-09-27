/**
 * Returns the dedicated stream transform to remove the rom header
 * https://docs.retroachievements.org/Game-Identification/
 */
import { extname } from 'path';
import { NesHeaderRemover } from './removers/nes-header-remover';
import { N64HeaderRemover } from './removers/n64-header-remover';

export function getHeaderRemoverTransform(file: string) {
  const extension = extname(file).toLowerCase();
  if (extension === '.nes') {
    return new NesHeaderRemover();
  }
  if (['.z64', '.n64', '.v64'].includes(extension)) {
    return new N64HeaderRemover();
  }
}
