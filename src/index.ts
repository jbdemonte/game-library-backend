import { startDropZoneScan } from './dropzone';
import { database } from './tools/database';
import { startScrapDaemon } from './scrap';


(async () => {

  await database.connect();

  await startScrapDaemon();

  await startDropZoneScan();

})();
