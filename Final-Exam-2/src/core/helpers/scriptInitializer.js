import { createSharedAccounts, initializeAccountManager } from '../../utils/accountManager.js';

/**
 * Common initialization for K6 test scripts
 * Sets up SharedArray-based account storage for concurrent-safe operations
 */
export function initializeScript() {
  const sharedAccounts = createSharedAccounts([]);
  initializeAccountManager(sharedAccounts);
  return sharedAccounts;
}

