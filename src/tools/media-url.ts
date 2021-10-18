import { MediaDocument } from '../models/game.model';
import { getAPIURL } from '../config';

export function mediaUrl(systemId: string, gameId: string, media: MediaDocument): string {
  return `${getAPIURL()}/medias/${systemId}/${gameId}/${media.file}`;
}
