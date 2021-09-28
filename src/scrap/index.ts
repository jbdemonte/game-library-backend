import { noIntroDB } from '../no-intro';
import { getNoIntroDataPath } from './lib/no-intro-folder';
import { scrapNextFile } from './lib/scrap.service';
import { getScrapConfig } from '../config';

const config = getScrapConfig();

export async function startScrapDaemon() {
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
      setTimeout(proceed, config.durationBetweenTwoScraps);
    } else {
      setTimeout(proceed, config.sleepTimeOnIdle);
    }
  } catch (err) {
    console.log(err);
  }
}
