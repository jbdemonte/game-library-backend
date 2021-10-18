import { config as loadDotEnv } from 'dotenv';
loadDotEnv();

export const getAPIURL = () => {
  if (!process.env.API_URL) {
    throw new Error('API_URL is empty');
  }
  return process.env.API_URL;
}

export const getTempPath = () => {
  if (!process.env.TMP_PATH) {
    throw new Error('TMP_PATH is empty');
  }
  return process.env.TMP_PATH;
}

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

export const getScrapConfig = () => {
  if (!process.env.SCRAP_PATH) {
    throw new Error('SCRAP_PATH is empty');
  }
  return {
    scrapPath: process.env.SCRAP_PATH,
    noIntroParentPath: 'data',
    retry: parseInt(process.env.SCRAP_RETRY || '') || 5,
    sleepTimeOnIdle: 1000 * (parseInt(process.env.SLEEP_TIME_ON_IDLE || '') || 60),
    sleepTimeBeforeScrapping: (1000 * (parseInt(process.env.SLEEP_TIME_BEFORE_DOWNLOADING_FILE || '') || 0)) || 250,
    durationBetweenTwoScraps: 1000 * (parseInt(process.env.SLEEP_TIME_BETWEEN_TWO_SCRAPS || '') || 10),
    durationBeforeRetryingAFailedScrap: 1000 * (parseInt(process.env.SLEEP_TIME_BEFORE_RETRYING_A_FAILED_SCRAP || '') || 24 * 3600),
    scrapTimeout: 1000 * (parseInt(process.env.SCRAP_TIMEOUT || '') || 60),
  };
};

export const getScreenscraperCredentials = () => ({
  softname: process.env.SCREENSCRAPER_SOFTNAME ?? '',
  devid: process.env.SCREENSCRAPER_DEVID ?? '',
  devpassword: process.env.SCREENSCRAPER_DEVPASSWORD ?? '',
});

export const getServerConfig = () => ({
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  HOSTNAME: process.env.HOSTNAME ?? '',
});
