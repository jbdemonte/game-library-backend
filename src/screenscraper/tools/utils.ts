import { getScreenscraperRegionOrder } from '../../config';

const order = getScreenscraperRegionOrder();

function getByLng<T extends ({ region?: string; langue?: string })>(items: T[]): T {
  return items.reduce((selected, current) => {
    const p1 = order.indexOf(selected.region || selected.langue || '');
    const p2 = order.indexOf(current.region || current.langue || '');
    if (p2 < 0) {
      return selected;
    }
    if (p1 < 0) {
      return current;
    }
    return p1 < p2 ? selected : current;
  });
}

export function getTextByLng<T extends ({ region?: string; langue?: string; text?: string; })>(items?: T[]): string {
  if (items && items.length) {
    return getByLng(items).text || '';
  }
  return '';
}
