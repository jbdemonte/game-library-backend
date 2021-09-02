import { config as loadDotEnv } from 'dotenv';
loadDotEnv();

import { startDropZoneScan } from './dropzone';

(async () => {

  await startDropZoneScan();

})();
