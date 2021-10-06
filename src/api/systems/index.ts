import { Router, Request, Response } from 'express';
import { romModel } from '../../models/rom.model';

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

export {
  router
};
