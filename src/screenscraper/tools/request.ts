import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { getProxy, nextProxy } from '../../proxies';
import { getDefaultHeaders } from '../../tools/http';
import { getScrapConfig } from '../../config';

const { scrapTimeout } = getScrapConfig();

export async function request<T = any, R = AxiosResponse<T>>(base: AxiosRequestConfig): Promise<R> {
  const proxy1 = getProxy();

  const config = {...base, headers: getDefaultHeaders(base.headers)}

  if (!proxy1) {
    return axios.request(config);
  }

  let proxy = proxy1;

  while (true) {
    console.log(`requesting using ${proxy.type}:${proxy.host}:${proxy.port} : ${config.url}`);
    const source = axios.CancelToken.source();
    const cancelToken = source.token;
    const client = axios.create({
      httpsAgent: new SocksProxyAgent({
        host: proxy.host,
        port: proxy.port,
        type: proxy.type === 'socks5' ? 5 : 4
      })
    });
    const cancelTimeout = setTimeout(() => source.cancel('timeout'), scrapTimeout);
    try {
      const res = await client.request<T, R>({...config, cancelToken});
      clearTimeout(cancelTimeout);
      return res;
    } catch (err) {
      clearTimeout(cancelTimeout);
      if ((err as any).response) {
        throw err;
      }
      if ((err as Error).message) {
        console.log((err as Error).message)
      }
      // else, may be due to a proxy error, so retry
      proxy = nextProxy();
      if (proxy === proxy1) {
        // all proxies have been tested, so exit the infinity loop
        throw new Error('Request failed due to proxy errors');
      }
    }
  }

}
