import { startDropZoneScan } from './dropzone';
import { database } from './tools/database';
import { startScrapDaemon } from './scrap';
import { startProxyDaemon } from './proxies';
import { startAPI } from './api';
import { areCronEnabled, isApiEnabled } from './config';

(async () => {

  await database.connect();

  console.log(`CRON: ${areCronEnabled ? 'ON' : 'OFF'}`);

  console.log(`API: ${isApiEnabled ? 'ON' : 'OFF'}`);

  if (areCronEnabled) {
    await startProxyDaemon();

    await startScrapDaemon();

    await startDropZoneScan();
  }

  if (isApiEnabled) {
    startAPI();
  }

})();
