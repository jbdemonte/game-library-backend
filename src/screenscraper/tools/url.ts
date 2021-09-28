import { getScreenscraperCredentials } from '../../config';
import { getAccount } from './user-account';

const SCRAP_API = 'https://www.screenscraper.fr/api2';
const credentials = getScreenscraperCredentials();

function removeEmptyParams(source: { [key: string]: any }): { [key: string]: any } {
  const result: { [key: string]: any } = {};
  Object.keys(source).forEach(key => {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      result[key] = source[key];
    }
  })
  return result;
}

export function buildQueryParams(query: Record<string, any>): string {
  return new URLSearchParams(removeEmptyParams(query)).toString();
}

export function buildURL(endpoint: string, query: Record<string, any>): string {
  const queryParams = buildQueryParams({
    ...credentials,
    ...getAccount(),
    ...query,
    output: 'json'
  });

  return `${SCRAP_API}/${endpoint}?${queryParams}`;
}

export function removeCredentials(url: string): string {
  // remove previous credentials
  url = url.replace(/([&?])(ssid|sspassword|devid|devpassword|softname)=[^&]+/g, function (match, p1) {
    return p1 === '?' ? '?' : '';
  });
  return url;
}
