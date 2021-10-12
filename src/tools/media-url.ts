import { MediaDocument } from '../models/game.model';

export function mediaUrl(systemId: string, gameId: string, media: MediaDocument): string {
  return `/medias/${systemId}/${gameId}/${media.file}`;
}
