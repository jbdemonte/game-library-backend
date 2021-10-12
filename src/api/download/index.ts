import { Router, Request, Response } from 'express';
import { join, resolve } from 'path';
import { fileExists, getRelativePath } from '../../tools/file';
import { getDropzoneConfig } from '../../config';
import { romModel } from '../../models/rom.model';
import { isSystemId } from '../../tools/is-system';
import { isMongoId } from '../../tools/is-mongo-id';
const { roms: romsPath } = getDropzoneConfig();

const router = Router();

router.get('/:systemId/:romId/:file', async (req: Request, res: Response) => {
  const { systemId, romId, file } = req.params;

  if (isSystemId(systemId) && isMongoId(romId)) {
    const rom = await romModel.findById(romId);
    if (rom && rom.archive.name === file && rom.system === systemId) {
      const filePath = resolve(join(romsPath, getRelativePath(systemId, rom.id), file));
      const exist = await fileExists(filePath);
      if (exist) {
        return res.sendFile(filePath);
      }
    }
  }
  res.sendStatus(404);
});

export {
  router
};
