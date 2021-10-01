import { IProxy } from '../interfaces/proxy.interface';
import { loadFromTmp, saveToTmp } from './lib/cache';
import { downloadProxyList } from './lib/download';
import { sortProxyList } from './lib/sort';

const TTL = 86400;
const countryCodes = ['FR', 'IT', 'GB', 'CH'];

let proxies: IProxy[] = [];
let proxyId = 0;

export async function startProxyDaemon() {
  proxies = await loadFromTmp();
  if (proxies.length) {
    console.log(`proxy list reloaded from cache (${proxies.length})`);
  } else {
    await refreshProxyList();
  }
  setInterval(refreshProxyList, TTL * 1000);
}

async function refreshProxyList() {
  const list: IProxy[] = [];
  console.log('refreshing proxy list')
  for (const countryCode of countryCodes) {
    list.push(...await downloadProxyList(countryCode))
  }
  if (list.length) {
    proxies = sortProxyList(list);
    await saveToTmp(proxies);
  }
}

export function getProxy(): IProxy | undefined {
  return proxies[proxyId];
}

export function nextProxy(): IProxy {
  if (!proxies.length) {
    throw new Error('proxy list is empty');
  }
  proxyId = (proxyId + 1) % proxies.length;
  return proxies[proxyId];
}
