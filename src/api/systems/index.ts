import { Router, Request, Response } from 'express';
import { IRom, romModel } from '../../models/rom.model';
import { mediaUrl } from '../../tools/media-url';
import { MediaDocument } from '../../models/game.model';
import { fileUrl } from '../../tools/file-url';

const router = Router();

/**
 * Returns systems status
 */
router.get('/', async (req: Request, res: Response) => {
  const status = await romModel.aggregate([
    { $group: {
      _id: '$system',
      games: { $addToSet: '$game' },
      roms: { $count : {} },
      scraps: { $sum: { $cond: { if: { $ne: ['$game', null] }, then: 1, else: 0 } }}
    } },
    {
      $project: {
        _id: 0,
        system: '$_id',
        games: { $reduce: { input: '$games', initialValue: 0, in: { $cond: { if: { $ne: ['$$this', null] }, then: { $sum: ["$$value", 1]}, else : "$$value" } } } } ,
        roms: 1,
        scraps: 1,
      }
    }
  ]).exec();
  res.send({ status })
});

function castROM(system: string, rom: Pick<IRom, 'archive' | 'files'> & { _id: any }) {
  const id: string = rom._id.toString();
  return {
    id: rom._id.toString(),
    archive: {
      ...rom.archive,
      url: fileUrl(system, id, rom.archive.name)
    },
    files: rom.files,
  };
}

/**
 * Returns game & rom listing for a system
 */
router.get('/:system/', async (req: Request, res: Response) => {
  const scraped = await romModel.aggregate([
    { $match: { system: req.params.system, game: { $ne: null } } },
    { $group: { _id: '$game', roms: { $push: { _id: '$_id', archive: '$archive', files: '$files' } } } },
    { $lookup: { from: 'games', localField: '_id', foreignField: '_id', as: 'game' } },
    { $project: { _id: 0, roms: 1, game: { id: '$_id', name: 1, genres: 1, grade: 1, date: 1, medias: 1, synopsis: 1, players: 1 } } },
    { $unwind: '$game' }
  ]).exec();

  const castROMToSystem = castROM.bind(null, req.params.system);

  for (const item of scraped) {
    item.game.medias = item.game.medias.map((media: MediaDocument) => ({ type: media.type, region: media.region, url: mediaUrl(req.params.system, item.game.id, media) }))
    item.roms = item.roms.map(castROMToSystem)
  }

  const roms = await romModel.find({ system: req.params.system, game: { $eq: null } }, { archive: 1, files: 1}).lean();

  res.send({ scraped, roms: roms.map(castROMToSystem) });
});

export {
  router
};
