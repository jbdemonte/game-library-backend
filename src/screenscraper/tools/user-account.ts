import { ISSAccount } from '../../interfaces/screenscraper-account.interface';
import { shuffle } from '../../tools/array';
import { getScreenscraperCredentialFile } from '../../config';

function isISSAccount(item: any) : item is ISSAccount {
  return typeof item === 'object' && Object.keys(item).length === 2 && typeof item.ssid === 'string' && typeof item.sspassword === 'string';
}

const accounts = shuffle((require(getScreenscraperCredentialFile()) as any[]).filter(isISSAccount));

let accountId = 0;

export function getAccount() {
  return accounts[accountId];
}

export function nextAccount() {
  console.log(`\nswitching to next account...`);
  accountId = (accountId + 1) % accounts.length;
  return accounts[accountId];
}
