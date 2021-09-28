import axios from 'axios';
import { GameResume, getGameResume } from './tools/resume';
import { nextAccount } from './tools/user-account';
import { buildURL } from './tools/url';


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
    const { data: { response: { jeu }} } = await axios.request({ url, method: 'GET' });
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
