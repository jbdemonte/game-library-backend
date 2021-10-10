import { Router, Request, Response } from 'express';
import { fileExists, getRelativePath } from '../../tools/file';
import { join, resolve } from 'path';
import { getScrapConfig } from '../../config';
const { scrapPath } = getScrapConfig();

const router = Router();

const reSystem = /^[a-z0-9]+$/;
const reMongoId = /^[0-9a-f]{24}$/;
const reIsFile = /^[a-z0-9_-]+\.[a-z0-9]+$/;

router.get('/:system/:gameId/:file', async (req: Request, res: Response) => {
  const { system, gameId, file } = req.params;
  if (system.match(reSystem) && gameId.match(reMongoId) && file.match(reIsFile)) {
    const filePath = resolve(join(scrapPath, getRelativePath(system, gameId), file));
    const exist = await fileExists(filePath);
    if (exist) {
      return res.sendFile(filePath);
    }
  }
  res.sendStatus(404);
});

export {
  router
};
