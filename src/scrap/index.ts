import { noIntroDB } from '../no-intro';
import { scrapNextFile } from './lib/scrap.service';
import { getScrapConfig } from '../config';

const config = getScrapConfig();

export async function startScrapDaemon() {
  await noIntroDB.connect(config.noIntroPath);
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
