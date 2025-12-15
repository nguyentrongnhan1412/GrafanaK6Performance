import { createSharedAccounts, initializeAccountManager } from '../../utils/accountManager.js';

export function initializeScript() {
  const sharedAccounts = createSharedAccounts([]);
  initializeAccountManager(sharedAccounts);
  return sharedAccounts;
}

