import { GameResume, getGameResume } from './tools/resume';
import { nextAccount } from './tools/user-account';
import { addCredentials, buildURL } from './tools/url';
import { sleep } from '../tools/time';
import { getScrapConfig } from '../config';
import { request } from './tools/request';

const config = getScrapConfig();

type GetGameInfoParams = {
  name: string;
  md5: string;
  system: number;
};

export async function getGameData(params: GetGameInfoParams): Promise<GameResume | null> {
  const url = buildURL('jeuInfos.php', {
    romnom: params.name,
    md5: params.md5,
    systemeid: params.system,
  })
  try {
    const { data: { response: { jeu }} } = await request({ url, method: 'GET' });
    return getGameResume(jeu);
  } catch (error) {
    if ((error as any).response?.status === 430) { // quota exceeded
      nextAccount();
      return getGameData(params);
    } else {
      console.error(url + ' : ' + (error as Error).message);
    }
  }
  return null
}


export async function getFileContent(url: string, retry: number): Promise<any> {
  await sleep(config.sleepTimeBeforeScrapping);
  try {
    const { data } = await request({
      url: addCredentials(url),
      method: 'GET',
      responseType: 'arraybuffer',
    });
    if (!data && retry) {
      console.log(`empty content, retrying... (${retry})`);
      return await getFileContent(url, retry - 1);
    }
    return data || '';
  } catch (error) {
    const status = (error as any).response?.status || 0;
    console.error(url + ' : ' + (error as Error).message);
    if ( (status === 401 && (error as any).response?.data !== 'NOMEDIA') || (status === 430) || (status === 431) ) { // API close for this member? | quota exceeded | too much "not found" |
      nextAccount();
      return await getFileContent(url, retry);
    }
    if (status === 423) { // API closed for a while
      if (retry) {
        console.log(`API closed, retrying in a few seconds... (${retry})`);
        await sleep(60 * 1000);
        return await getFileContent(url, retry - 1);
      }
    }
  }
  return '';
}
