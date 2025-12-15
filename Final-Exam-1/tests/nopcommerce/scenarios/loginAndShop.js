import { sleep } from 'k6';
import { NopCommerceLoginService } from '../services/NopCommerceLoginService.js';
import { NopCommerceShoppingService } from '../services/NopCommerceShoppingService.js';
import { getAccountManager } from '../../../src/utils/accountManager.js';
import { Logger } from '../../../src/utils/logger.js';
import { nopCommerceConfig } from '../config.js';

export class LoginAndShopScenario {
  constructor() {
    this.loginService = new NopCommerceLoginService();
    this.shoppingService = new NopCommerceShoppingService();
    this.accountManager = getAccountManager();
    this.logger = new Logger('LoginAndShopScenario');
  }

  execute() {
    this.logger.info(`VU ${__VU} iteration ${__ITER} starting`);

    this.accountManager.reload();
    let account = this.accountManager.getAccountForVU(__VU, nopCommerceConfig.loginAndShop.vus);

    if (!account) {
      const maxRetries = 3;
      let retryCount = 0;
      
      while (!account && retryCount < maxRetries) {
        const backoffDelay = Math.pow(2, retryCount) * 0.1;
        sleep(backoffDelay);
        this.accountManager.reload();
        account = this.accountManager.getAccountForVU(__VU, nopCommerceConfig.loginAndShop.vus);
        
        if (!account) {
          account = this.accountManager.getRandomAccount();
        }
        
        retryCount++;
      }
      
      if (!account) {
        this.logger.error(`VU ${__VU} - No account available for login after ${maxRetries} retries`);
        return;
      }
    }

    this.logger.info(`VU ${__VU} attempting to login with: ${account.email}`);

    const loginResult = this.loginService.login(account.email, account.password);

    if (loginResult.success) {
      const shopResult = this.shoppingService.shop();

      if (shopResult.success) {
        this.logger.info(`VU ${__VU} iteration ${__ITER} completed successfully`);
      } else {
        this.logger.warn(`VU ${__VU} iteration ${__ITER} shopping failed`);
      }
    } else {
      this.logger.error(`VU ${__VU} iteration ${__ITER} login failed for: ${account.email}`);
    }
  }
}

const scenario = new LoginAndShopScenario();
export function loginAndShop() {
  scenario.execute();
}

