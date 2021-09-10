import { config as loadDotEnv } from 'dotenv';
loadDotEnv();

import { startDropZoneScan } from './dropzone';
import { database } from './tools/database';
import { startScrapDaemon } from './scrap';

if (!process.env.DROPZONE_PATH) {
  throw new Error('DROPZONE_PATH is empty');
}

if (!process.env.TMP_PATH) {
  throw new Error('TMP_PATH is empty');
}

if (!process.env.ROMS_PATH) {
  throw new Error('ROMS_PATH is empty');
}

(async () => {

  await database.connect({
    host: process.env.MONGODB_HOST || '',
    port: process.env.MONGODB_PORT || '',
    name: process.env.MONGODB_DB_NAME || '',
  });

  await startScrapDaemon({
    noIntroParentPath: 'data'
  });

  await startDropZoneScan({
    dropZone: process.env.DROPZONE_PATH!,
    tmp: process.env.TMP_PATH!,
    roms: process.env.ROMS_PATH!,
  });

})();
