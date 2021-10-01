import { IProxy } from '../../interfaces/proxy.interface';

export function parse(html: string): IProxy[] {
  const result: IProxy[] = [];
  const match = html.match(/<table id="proxy_list">.*?<tbody>(.*?)<\/tbody><\/table>/);
  if (match) {
    const lines = match[1].matchAll(/<tr>(.*?)<\/tr>/g)
    for (const line of lines) {
      const columns = [...line[1].matchAll(/<td.*?>(.*?)<\/td>/g)].map(capture => capture[1]);
      if (columns.length === 11) {
        const host = getHost(columns[0]);
        const port = parseInt(getPort(columns[1]));
        const type = getValue(columns[2]).toLowerCase();
        const country = getCountry(columns[3]);
        const speed = parseInt(getValue(columns[7])); // speed is always in kB/s or empty
        const availability = parseFloat(getValue(columns[8])) ?? NaN; // availability is always a percent or NaN
        const ping = parseInt(getValue(columns[9])) // ping is always in ms;
        result.push({ host, port, type, country, speed, availability, ping });
      }
    }
  }
  return result;
}

function getHost(td: string): string {
  const match = td.match(/Base64.decode\("(.*?)"\)/);
  return match ? Buffer.from(match[1], 'base64').toString('ascii') : '';
}

function getPort(td: string): string {
  const match = td.match(/<span.*>(.*)<\/span>/);
  return match ? match[1] : '';
}

function getCountry(td: string): string {
  const match = td.match(/<a.*>(.*)<\/a>/);
  return match ? match[1] : '';
}

function getValue(td: string): string {
  const match = td.match(/<small.*>(.*)<\/small>/);
  return match ? match[1] : '';
}

export function getNextPage(html: string): string {
  const match = html.match(/<div class="paginator">.*?a href="([^"]+)">autre.*?<\/a><\/div>/);
  return match ? match[1] : '';
}
