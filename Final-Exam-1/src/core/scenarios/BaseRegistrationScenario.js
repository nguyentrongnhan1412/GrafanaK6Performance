import { getAccountManager } from '../../utils/accountManager.js';
import { Logger } from '../../utils/logger.js';

export class BaseRegistrationScenario {
  constructor(registrationService, config) {
    this.registrationService = registrationService;
    this.config = config;
    this.accountManager = getAccountManager();
    this.logger = new Logger('BaseRegistrationScenario');
  }

  execute() {
    this.logger.info(`VU ${__VU} starting registration`);

    const result = this.registrationService.registerUser();

    if (result.success && result.user) {
      const added = this.accountManager.addAccount(result.user);
      
      if (added) {
        this.logger.info(`VU ${__VU} successfully registered account: ${result.user.email}`);
      } else {
        this.logger.warn(`VU ${__VU} registered but failed to add account: ${result.user.email}`);
      }
    } else {
      this.logger.error(`VU ${__VU} failed to register user`);
    }
  }
}

