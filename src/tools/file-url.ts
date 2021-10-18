import { getAPIURL } from '../config';

export function fileUrl(systemId: string, romId: string, file: string): string {
  return `${getAPIURL()}/download/${systemId}/${romId}/${file}`;
}
