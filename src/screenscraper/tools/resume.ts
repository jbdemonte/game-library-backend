import { decode } from 'html-entities';
import mediaToDownload from '../../data/media-to-download-screenscraper.json';
import { I_SS_Game, I_SS_Media, I_SS_RomFound } from '../../interfaces/screenscraper-game.interface';
import { getTextByLng } from './utils';
import { removeCredentials } from './url';

export function getMediaResume(media: I_SS_Media) {
  return {
    type: media.type.toLowerCase(),
    region: (media.region || '').toLowerCase(),
    format: media.format.toLowerCase(),
    url: media.url,
  }
}

export function getRomFoundResume(rom: I_SS_RomFound) {
  return {
    region: rom.romregions,
  }
}

export interface GameResume {
  id: string;
  name: string;
  synopsis: string;
  date: string;
  grade?: number;
  players?: number;
  genres: string[];
  medias: Array<{
    type: string;
    region: string;
    format: string;
    url: string;
  }>;
  rom?: {
    region: string;
  };
  raw: I_SS_Game;
}

export function getGameResume(raw: I_SS_Game): GameResume {
  const game = {
    ...raw,
    medias: raw.medias.map(media => ({...media, url: removeCredentials(media.url)}))
  }
  return {
    id: game.id,
    name: getTextByLng(game.noms),
    synopsis: decode(getTextByLng(game.synopsis)),
    date: getTextByLng(game.dates),
    grade: parseInt(game.note?.text) || undefined,
    players: parseInt(game.joueurs?.text) || undefined,
    genres: game.genres?.map(genre => getTextByLng(genre.noms)) || [],
    medias: game.medias.filter(media => (mediaToDownload as any)[media.type]).map(getMediaResume),
    rom: game.rom ? getRomFoundResume(game.rom) : undefined,
    raw: game,
  }
}
