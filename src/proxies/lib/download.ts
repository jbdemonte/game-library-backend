import axios from 'axios';
import { getDefaultHeaders } from '../../tools/http';
import { IProxy } from '../../interfaces/proxy.interface';
import { getNextPage, parse } from './parser';

async function request(url: string): Promise<IProxy[]> {
  const res = await axios.request({
    url: `http://free-proxy.cz${url}`,
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  const nextPage = getNextPage(res.data);
  return parse(res.data).concat(nextPage ? await request(nextPage) : []);
}

export async function downloadProxyList(countryCode: string): Promise<IProxy[]> {
  try {
    return request(`/fr/proxylist/country/${countryCode}/socks/ping/all`)
  } catch (err) {
    console.log((err as any).response?.data || (err as Error).message || err);
    return [];
  }
}
