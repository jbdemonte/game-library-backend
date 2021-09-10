import { readdir } from 'fs/promises';
import { extname, join } from 'path';
import { getSystem } from '../tools/systems';
import { getGameList } from './lib/game-list';

class NoIntroDB {
  private files: string[] = [];
  private hashMaps: { [systemId: string]: { [md5: string]: Game }} = {};
  private games: { [systemId: string]: Game[]} = {};

  constructor() {}

  async connect(path: string) {
    const entries = await readdir(path, { withFileTypes: true })
    this.files = entries
      .filter(entry => !entry.isDirectory() && extname(entry.name) === '.dat')
      .map(entry => join(path, entry.name));
  }

  private async load(systemId: string) {
    if (!this.hashMaps[systemId]) {
      const system = getSystem(systemId);
      const pattern = system['no-intro'];
      if (pattern) {
        const files = this.files.filter(file => file.indexOf(pattern) >= 0);
        this.hashMaps[systemId] = {}
        this.games[systemId] = [];
        if (files.length === 0) {
          throw new Error(`no files are starting with ${pattern}`);
        }
        for (const file of files) {
          const games = await getGameList(file);
          for (const game of games) {
            this.games[systemId].push(game);
            for (const rom of game.roms) {
              if (rom.md5) {
                if (this.hashMaps[systemId][rom.md5]) {
                  throw new Error(`two games has the same md5 : ${rom.md5}`);
                }
                this.hashMaps[systemId][rom.md5] = game;
              }
            }
          }
        }
      } else {
        console.log(`no pattern for system ${systemId}`);
      }
    }

  }

  async find(systemId: string, md5: string): Promise<Game | undefined> {
    await this.load(systemId);
    return this.hashMaps[systemId] ? this.hashMaps[systemId][md5] : undefined;
  }

  getClones(systemId: string, game: Game): Game[] {
    return this.games[systemId].filter(item => (item.name === game.cloneof || (item.cloneof === game.cloneof && game.cloneof) || item.cloneof === game.name) && item.name !== game.name);
  }
}

export type NoIntroGame = Game;

export const noIntroDB = new NoIntroDB();
