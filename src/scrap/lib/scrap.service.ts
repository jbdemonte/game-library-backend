import { romModel } from '../../models/rom.model';
import { noIntroDB, NoIntroGame } from '../../no-intro';
import { GameDocument, gameModel } from '../../models/game.model';

export async function scrapNextFile(durationBeforeRetryingAFailedScrap: number): Promise<boolean> {
  let rom = await romModel.findOne({ game: null, lastScrap: null });

  if (!rom) {
    rom = await romModel.findOne({ game: null, lastScrap: { $lt: new Date(Date.now() - 1000 * durationBeforeRetryingAFailedScrap) } });
  }

  if (!rom) {
    return false;
  }

  console.log(`searching for ${rom.system} : ${rom.files[0].name} :  ${rom.files[0].md5}`);

  rom.lastScrap = new Date();

  const noIntroGame = await noIntroDB.find(rom.system, rom.files[0].md5);

  if (noIntroGame) {
    let game = await getGameFromClones(rom.system, noIntroGame);

    if (!game) {
      game = new gameModel({
        system: rom.system,
        name: noIntroGame.cloneof || noIntroGame.name,
      });
      await game.save();
    }

    rom.game = game._id;
  }

  await rom.save();

  return true;
}

async function getGameFromClones(systemId: string, noIntroGame: NoIntroGame): Promise<GameDocument|null> {
  const clones = noIntroDB.getClones(systemId, noIntroGame);
  if (clones.length) {
    const rom = await romModel.findOne({ game: {$ne: null}, 'files.md5': { $in: clones.map(clone => clone.roms.map(rom => rom.md5 )).flat() }})
    if (rom && rom.game) {
      return gameModel.findById(rom.game);
    }
  }
  return null;
}

