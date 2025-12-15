import { getAccountManager } from '../../utils/accountManager.js';
import { Logger } from '../../utils/logger.js';

export class BaseTestRunner {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('BaseTestRunner');
    this.isCloudMode = __ENV.K6_CLOUD === 'true' || __ENV.K6_CLOUD_TOKEN !== undefined;
  }

  setup() {
    this.logger.info('Test setup started');
    this.logger.info('Using SharedArray for account storage (concurrent-safe)');
    const accountManager = getAccountManager();
    const accountCount = accountManager.getAccountCount();
    this.logger.info(`Initial account count: ${accountCount}`);
    
    return {
      accountCount,
      isCloudMode: this.isCloudMode,
    };
  }

  teardown(data) {
    this.logger.info('Test teardown started');
    const accountManager = getAccountManager();
    const finalAccountCount = accountManager.getAccountCount();
    
    this.logger.info(`Final account count: ${finalAccountCount}`);
    
    if (this.isCloudMode) {
      this.logger.info('Cloud mode detected - skipping file save (file writes not supported in K6 Cloud)');
    } else {
      const saved = accountManager.saveAccounts();
      if (saved) {
        this.logger.info(`Accounts saved to: ${this.config.accounts.storageFile}`);
      } else {
        this.logger.warn(`Failed to save accounts to: ${this.config.accounts.storageFile}`);
      }
    }
    
    return {
      initialAccountCount: data.accountCount,
      finalAccountCount: finalAccountCount,
      accountsCreated: finalAccountCount - data.accountCount,
      isCloudMode: data.isCloudMode,
    };
  }
}

