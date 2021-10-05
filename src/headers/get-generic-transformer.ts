/**
 * Returns the dedicated stream transformer to manipulate the ROM binary content
 * https://docs.retroachievements.org/Game-Identification/
 * http://snarfblam.com/files/Hasher/1.0%20Readme.html
 */
import { extname } from 'path';
import { NesTransformer } from './transformers/nes.transformer';
import { N64Transformer } from './transformers/n64.transformer';
import { SNesTransformer } from './transformers/snes.transformer';
import { FdsTransformer } from './transformers/fds.transformer';

export function getGenericTransformer(file: string) {
  const extension = extname(file).toLowerCase();
  if (extension === '.nes') {
    return new NesTransformer();
  }
  if (extension === '.fds') {
    return new FdsTransformer();
  }
  if (['.z64', '.n64', '.v64'].includes(extension)) {
    return new N64Transformer();
  }
  if (['.mgd', '.smc', '.sfc'].includes(extension)) {
    return new SNesTransformer();
  }
}
