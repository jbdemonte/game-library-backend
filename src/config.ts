import { config as loadDotEnv } from 'dotenv';
loadDotEnv();

export const getDropzoneConfig = () => {
  if (!process.env.DROPZONE_PATH) {
    throw new Error('DROPZONE_PATH is empty');
  }

  if (!process.env.TMP_PATH) {
    throw new Error('TMP_PATH is empty');
  }

  if (!process.env.ROMS_PATH) {
    throw new Error('ROMS_PATH is empty');
  }

  return {
    dropZone: process.env.DROPZONE_PATH,
    tmp: process.env.TMP_PATH,
    roms: process.env.ROMS_PATH,
  }
}

export const getDatabaseConfig = () => ({
  host: process.env.MONGODB_HOST || '',
  port: process.env.MONGODB_PORT || '',
  name: process.env.MONGODB_DB_NAME || '',
  debug: process.env.MONGODB_DB_DEBUG === '1'
});

export const getScrapConfig = () => ({
  noIntroParentPath: 'data',
  retry: parseInt(process.env.SCRAP_RETRY || '') || 5,
  sleepTimeOnIdle: 1000 * (parseInt(process.env.SLEEP_TIME_ON_IDLE || '') || 60),
  sleepTimeBeforeScrapping: (1000 * (parseInt(process.env.SLEEP_TIME_BEFORE_DOWNLOADING_FILE || '') || 0)) || 100,
  durationBetweenTwoScraps: 1000  * (parseInt(process.env.SLEEP_TIME_BETWEEN_TWO_SCRAPS || '') || 10),
  durationBeforeRetryingAFailedScrap: 1000 * (parseInt(process.env.SLEEP_TIME_BEFORE_RETRYING_A_FAILED_SCRAP || '') || 24 * 3600),
});

export const getScreenscraperCredentials = () => ({
  softname: process.env.SCREENSCRAPER_SOFTNAME ?? '',
  devid: process.env.SCREENSCRAPER_DEVID ?? '',
  devpassword: process.env.SCREENSCRAPER_DEVPASSWORD ?? '',
});
