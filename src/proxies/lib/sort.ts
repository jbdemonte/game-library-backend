import { IProxy } from '../../interfaces/proxy.interface';

export function sortProxyList(proxies: IProxy[]): IProxy[] {
  return proxies.slice().sort((a, b) => rate(a) < rate(b) ? 1 : -1); // sort to get the best at [0] position
}

function rate(proxy: IProxy): number {
  return (proxy.speed || 10) * (proxy.availability || 0) / (proxy.ping || 10000);
}
