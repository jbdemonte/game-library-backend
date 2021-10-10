import { MediaDocument } from '../models/game.model';

export function mediaUrl(system: string, gameId: string, media: MediaDocument): string {
  return `/medias/${system}/${gameId}/${media.file}`;
}
