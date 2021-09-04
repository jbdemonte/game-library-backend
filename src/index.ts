import { config as loadDotEnv } from 'dotenv';
loadDotEnv();

import { startDropZoneScan } from './dropzone';
import { database } from './tools/database';

(async () => {

  await database.connect();

  await startDropZoneScan();

})();
