import { noIntroDB } from '../no-intro';
import { getNoIntroDataPath } from './lib/no-intro-folder';
import { scrapNextFile } from './lib/scrap.service';

type Config = {
  noIntroParentPath: string;
}

const DURATION_BETWEEN_TWO_SCRAPS = 2;
const SLEEP_TIME_ON_IDLE = 60;

export async function startScrapDaemon(config: Config) {
  const dataPath = await getNoIntroDataPath(config.noIntroParentPath);
  if (!dataPath) {
    throw new Error('No-Intro PC XML folder not found');
  }
  await noIntroDB.connect(dataPath);

  setImmediate(proceed);
}


async function proceed() {
  try {
    const saved = await scrapNextFile();
    if (saved) {
      setTimeout(proceed, 1000 * DURATION_BETWEEN_TWO_SCRAPS);
    } else {
      setTimeout(proceed, 1000 * SLEEP_TIME_ON_IDLE);
    }
  } catch (err) {
    console.log(err);
  }
}
