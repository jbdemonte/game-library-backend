import { Router, Request, Response } from 'express';
import { fileExists, getRelativePath } from '../../tools/file';
import { join, resolve } from 'path';
import { getScrapConfig } from '../../config';
import { isMongoId } from '../../tools/is-mongo-id';
import { isSystemId } from '../../tools/is-system';
const { scrapPath } = getScrapConfig();

const router = Router();

const reIsFile = /^[a-z0-9_-]+\.[a-z0-9]+$/;

router.get('/:systemId/:gameId/:file', async (req: Request, res: Response) => {
  const { systemId, gameId, file } = req.params;
  if (isSystemId(systemId) && isMongoId(gameId) && file.match(reIsFile)) {
    const filePath = resolve(join(scrapPath, getRelativePath(systemId, gameId), file));
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
