import { readdir } from 'fs/promises';
import { extname, join } from 'path';
import { getSystem } from '../tools/systems';
import { getGameList } from './lib/game-list';

class NoIntroDB {
  private files: string[] = [];
  private data: { [systemId: string]: { [md5: string]: Game }} = {};

  constructor() {}

  async connect(path: string) {
    const entries = await readdir(path, { withFileTypes: true })
    this.files = entries
      .filter(entry => !entry.isDirectory() && extname(entry.name) === '.dat')
      .map(entry => join(path, entry.name));
  }

  private async load(systemId: string) {
    if (!this.data[systemId]) {
      const system = getSystem(systemId);
      const pattern = system['no-intro'];
      if (pattern) {
        const files = this.files.filter(file => file.indexOf(pattern) >= 0);
        this.data[systemId] = {}
        if (files.length === 0) {
          throw new Error(`no files are starting with ${pattern}`);
        }
        for (const file of files) {
          const games = await getGameList(file);
          for (const game of games) {
            for (const rom of game.roms) {
              if (rom.md5) {
                if (this.data[systemId][rom.md5]) {
                  throw new Error(`two games has the same md5 : ${rom.md5}`);
                }
                this.data[systemId][rom.md5] = game;
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
    return this.data[systemId] ? this.data[systemId][md5] : undefined;
  }
}

export const noIntroDB = new NoIntroDB();
