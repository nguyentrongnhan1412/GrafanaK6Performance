import { SharedArray } from 'k6/data';
import { open, sleep } from 'k6';
import { baseConfig } from '../core/config/baseConfig.js';
import { Logger } from './logger.js';
import { User } from '../models/User.js';

export class AccountManager {
  constructor(storageFile = null, sharedAccounts = null, preGeneratedAccounts = null) {
    this.storageFile = storageFile || baseConfig.accounts.storageFile;
    this.logger = new Logger('AccountManager');
    this.accounts = [];
    this.sharedAccounts = sharedAccounts;
    this.isSharedArrayMode = sharedAccounts !== null;
    this.autoSave = false;
    
    if (this.isSharedArrayMode) {
      this._loadFromSharedArray();
    } else if (preGeneratedAccounts && preGeneratedAccounts.length > 0) {
      this.accounts = preGeneratedAccounts.map(data => User.fromJSON(data));
      this.logger.info(`Initialized with ${this.accounts.length} pre-generated accounts`);
      this._saveAccounts();
    } else {
      this._loadAccounts();
    }
  }

  _loadFromSharedArray() {
    if (this.sharedAccounts && this.sharedAccounts.length > 0) {
      this.accounts = this.sharedAccounts.map(data => User.fromJSON(data));
      this.logger.info(`Loaded ${this.accounts.length} accounts from SharedArray`);
    } else {
      this.accounts = [];
      this.logger.info('Initialized with empty SharedArray');
    }
  }

  _loadAccounts() {
    try {
      const file = open(this.storageFile, 'r');
      if (file) {
        const content = file.read();
        if (content) {
          const data = JSON.parse(content);
          this.accounts = Array.isArray(data) ? data.map(user => User.fromJSON(user)) : [];
          this.logger.info(`Loaded ${this.accounts.length} accounts from ${this.storageFile}`);
        }
        file.close();
      } else {
        this.accounts = [];
      }
    } catch (error) {
      this.accounts = [];
    }
  }

  _saveAccounts() {
    if (this.accounts.length === 0) {
      this.logger.info('No accounts to save');
      return true;
    }
    
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        if (retryCount > 0) {
          const backoffDelay = Math.random() * 0.1 + retryCount * 0.05;
          sleep(backoffDelay);
        }
        
        const file = open(this.storageFile, 'w');
        if (!file) {
          retryCount++;
          if (retryCount < maxRetries) {
            continue;
          }
          this.logger.error(`Failed to open file for writing after ${maxRetries} attempts: ${this.storageFile}`);
          return false;
        }
        
        const jsonData = JSON.stringify(this.accounts.map(user => user.toJSON()), null, 2);
        file.write(jsonData);
        file.close();
        this.logger.info(`Saved ${this.accounts.length} accounts to ${this.storageFile}`);
        return true;
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          continue;
        }
        this.logger.error(`Failed to save accounts to ${this.storageFile} after ${maxRetries} attempts`, error);
        return false;
      }
    }
    return false;
  }

  addAccount(user) {
    if (!(user instanceof User)) {
      user = new User(user);
    }

    if (this.accounts.some(acc => acc.email === user.email)) {
      this.logger.warn(`Account with email ${user.email} already exists`);
      return false;
    }

    this.accounts.push(user);
    this.logger.info(`Added new account: ${user.email}`);
    return true;
  }

  getAllAccounts() {
    return [...this.accounts];
  }

  getAccountByEmail(email) {
    return this.accounts.find(acc => acc.email === email) || null;
  }

  getAccountByIndex(index) {
    if (index >= 0 && index < this.accounts.length) {
      return this.accounts[index];
    }
    return null;
  }

  getRandomAccount() {
    if (this.accounts.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.accounts.length);
    return this.accounts[randomIndex];
  }

  getAccountForVU(vuNumber, totalVUs) {
    if (this.accounts.length === 0) {
      return null;
    }
    const index = (vuNumber - 1) % this.accounts.length;
    return this.accounts[index];
  }

  getAccountCount() {
    return this.accounts.length;
  }

  clearAccounts() {
    this.accounts = [];
    if (this.autoSave && !this.isSharedArrayMode) {
      this._saveAccounts();
    }
    this.logger.info('Cleared all accounts');
  }

  saveAccounts() {
    return this._saveAccounts();
  }

  reload() {
    if (this.isSharedArrayMode) {
      const sharedAccounts = this.sharedAccounts ? this.sharedAccounts.map(data => User.fromJSON(data)) : [];
      
      let fileAccounts = [];
      try {
        const file = open(this.storageFile, 'r');
        if (file) {
          const content = file.read();
          if (content) {
            const data = JSON.parse(content);
            fileAccounts = Array.isArray(data) ? data.map(user => User.fromJSON(user)) : [];
          }
          file.close();
        }
      } catch (error) {
      }
      
      const existingEmails = new Set(this.accounts.map(acc => acc.email));
      const allNewAccounts = [...sharedAccounts, ...fileAccounts].filter(acc => !existingEmails.has(acc.email));
      this.accounts = [...this.accounts, ...allNewAccounts];
      
      if (allNewAccounts.length > 0) {
        this.logger.info(`Reloaded ${allNewAccounts.length} new accounts`);
      }
    } else {
      this._loadAccounts();
    }
  }
}

let accountManagerInstance = null;
let sharedAccountsData = null;
let preGeneratedAccountsData = null;

export function initializeAccountManager(sharedAccounts = null, preGeneratedAccounts = null) {
  accountManagerInstance = new AccountManager(null, sharedAccounts, preGeneratedAccounts);
  sharedAccountsData = sharedAccounts;
  preGeneratedAccountsData = preGeneratedAccounts;
}

export function getAccountManager() {
  if (!accountManagerInstance) {
    accountManagerInstance = new AccountManager(null, sharedAccountsData, preGeneratedAccountsData);
  }
  return accountManagerInstance;
}

export function createSharedAccounts(accounts) {
  return new SharedArray('accounts', function () {
    return accounts.map(user => user.toJSON());
  });
}
