import { RomDocument, romModel } from '../../models/rom.model';
import { noIntroDB, NoIntroGame } from '../../no-intro';
import { GameDocument, gameModel } from '../../models/game.model';
import { getScrapConfig } from '../../config';
import { getSystem } from '../../tools/systems';
import { getFileContent, getGameData } from '../../screenscraper';
import { sleep } from '../../tools/time';
import { join } from 'path';
import { GameResume } from '../../screenscraper/tools/resume';
import { mkdir, writeFile } from 'fs/promises';
import { fileExists, getRelativePath } from '../../tools/file';

const config = getScrapConfig();

export async function scrapNextFile(): Promise<boolean> {
  let rom = await romModel.findOne({ game: null, lastScrap: null });

  if (!rom) {
    rom = await romModel.findOne({ game: null, lastScrap: { $lt: new Date(Date.now() - config.durationBeforeRetryingAFailedScrap) } });
  }

  if (!rom) {
    return false;
  }

  console.log(`searching for ${rom.system} : ${rom.files[0].name} : ${rom.files[0].md5}${rom.files[0].generic ? ` (${rom.files[0].generic.md5})` : ''}`);

  rom.lastScrap = new Date();

  let game = await getGameFromNoIntro(rom);

  game = await getGameFromScreenscraper(rom, game);

  if (game) {
    await game.save();
    rom.game = game._id
  }

  await rom.save();

  return true;
}

async function getGameFromNoIntro(rom: RomDocument): Promise<GameDocument|null> {
  let noIntroGame = await noIntroDB.find(rom.system, rom.files[0].md5);

  if (!noIntroGame && rom.files[0].generic) {
    noIntroGame = await noIntroDB.find(rom.system, rom.files[0].generic.md5);
  }

  if (noIntroGame) {
    let game = await getGameFromNoIntroClones(rom.system, noIntroGame);
    if (!game) {
      game = new gameModel({
        system: rom.system,
        name: noIntroGame.cloneof || noIntroGame.name,
      });
    }
    return game;
  }
  return null;
}

async function getGameFromNoIntroClones(systemId: string, noIntroGame: NoIntroGame): Promise<GameDocument|null> {
  const clones = noIntroDB.getClones(systemId, noIntroGame);

  if (clones.length) {
    const md5 = clones.map(clone => clone.roms.map(rom => rom.md5 )).flat();
    const rom = await romModel.findOne(
      {
        $and: [
          { game: {$ne: null} },
          { $or: [{ 'files.md5': { $in: md5 } }, { 'files.generic.md5': { $in: md5 } }] }
        ],
      }
    );
    if (rom && rom.game) {
      return gameModel.findById(rom.game);
    }
  }
  return null;
}

async function getGameFromScreenscraper(rom: RomDocument, game: GameDocument | null): Promise<GameDocument|null> {
  const system = getSystem(rom.system);
  if (!system.screenscraper) {
      return null;
  }

  const tuples: Array<{name: string, md5: string}> = [];

  const biggest = rom.files.reduce((previousValue, currentValue) => previousValue.size > currentValue.size ? previousValue : currentValue);

  if (biggest.generic) {
    tuples.push({ name: biggest.name, md5: biggest.generic.md5 });
  }
  tuples.push({ name: biggest.name, md5: biggest.md5 });
  if (rom.archive) {
    tuples.push({ name: rom.archive.name, md5: rom.archive.md5 });
  }

  for (let i = 0; i < tuples.length; i++) {
    if (i) {
      await sleep(config.durationBetweenTwoScraps);
    }
    const data = await getGameData({ system: system.screenscraper, name: tuples[i].name, md5: tuples[i].md5 });
    if (data) {
      if (!game) {
        game = new gameModel({ system: rom.system });
      }
      game.name = data.name;
      game.genres = data.genres;
      game.synopsis = data.synopsis;
      game.grade = data.grade;
      game.players = data.players;
      await downloadAllMediaFromScreenscraper(game, data, join(config.scrapPath, getRelativePath(game.system, game.id)))
      return game;
    }
  }
  return null;
}


export async function downloadAllMediaFromScreenscraper(game: GameDocument, resume: GameResume, dir: string) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'game.json'), JSON.stringify(resume.raw, null, 2), 'utf-8');

  for (const media of resume.medias) {
    const fileName = `${media.type}_${media.region}.${media.format}`;
    const filePath = join(dir, fileName);
    const exists = await fileExists(filePath);

    if (!exists) {
      console.log(`downloading ${game.id} ${game.name} : ${fileName}`);
      const data = await getFileContent(media.url, config.retry);
      if (data) {
        await writeFile(filePath, data);
      } else {
        continue;
      }
    }
    game.medias.push({
      type: media.type,
      region: media.region,
      format: media.format,
      file: fileName
    });
  }
}

