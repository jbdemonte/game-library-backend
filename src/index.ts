import { startDropZoneScan } from './dropzone';
import { database } from './tools/database';
import { startScrapDaemon } from './scrap';
import { startProxyDaemon } from './proxies';
import { startAPI } from './api';

(async () => {

  await database.connect();

  await startProxyDaemon();

  await startScrapDaemon();

  await startDropZoneScan();

  startAPI();

})();
