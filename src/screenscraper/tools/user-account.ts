import { ISSAccount } from '../../interfaces/screenscraper-account.interface';
import { shuffle } from '../../tools/array';

const accounts = shuffle<ISSAccount>(require('../../../screenscraper-credentials.json'));

let accountId = 0;

export function getAccount() {
  return accounts[accountId];
}

export function nextAccount() {
  console.log(`\nswitching to next account...`);
  accountId = (accountId + 1) % accounts.length;
  return accounts[accountId];
}
