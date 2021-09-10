import { romModel } from '../../models/rom.model';
import { noIntroDB } from '../../no-intro';
import { gameModel } from '../../models/game.model';

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
    const game = new gameModel({
      system: rom.system,
      name: noIntroGame.name,
    });

    rom.game = game._id;

    await game.save();
  }

  await rom.save();

  return true;
}
