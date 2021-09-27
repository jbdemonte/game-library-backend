/**
 * Returns the dedicated stream transformer to manipulate the ROM binary content
 * https://docs.retroachievements.org/Game-Identification/
 */
import { extname } from 'path';
import { NesTransformer } from './transformers/nes.transformer';
import { N64Transformer } from './transformers/n64.transformer';

export function getGenericTransformer(file: string) {
  const extension = extname(file).toLowerCase();
  if (extension === '.nes') {
    return new NesTransformer();
  }
  if (['.z64', '.n64', '.v64'].includes(extension)) {
    return new N64Transformer();
  }
}
