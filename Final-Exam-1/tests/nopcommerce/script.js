import { nopCommerceConfig } from './config.js';
import { registerUser as registerUserScenario } from './scenarios/registration.js';
import { loginAndShop as loginAndShopScenario } from './scenarios/loginAndShop.js';
import { BaseTestRunner } from '../../src/core/runners/BaseTestRunner.js';
import { initializeScript } from '../../src/core/helpers/scriptInitializer.js';
import { UserDataGenerator } from '../../src/core/helpers/UserDataGenerator.js';
import { initializeAccountManager } from '../../src/utils/accountManager.js';
import { NopCommerceRegistrationService } from './services/NopCommerceRegistrationService.js';

initializeScript();
const testRunner = new BaseTestRunner(nopCommerceConfig);

export function registerUser() {
  registerUserScenario();
}

export function loginAndShop(data) {
  if (data && data.accounts) {
    // Re-initialize account manager for this VU with pre-generated accounts
    initializeAccountManager(null, data.accounts);
  }

  // Create a new scenario instance ensures it uses the updated AccountManager
  loginAndShopScenario();
}

export const options = {
  scenarios: {
    registration: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: nopCommerceConfig.registration.rampUpDuration, target: nopCommerceConfig.registration.vus },
        { duration: nopCommerceConfig.registration.duration, target: nopCommerceConfig.registration.vus },
        { duration: nopCommerceConfig.registration.rampDownDuration, target: 0 },
      ],
      exec: 'registerUser',
    },

    loginAndShop: {
      executor: 'per-vu-iterations',
      vus: nopCommerceConfig.loginAndShop.vus,
      iterations: nopCommerceConfig.loginAndShop.iterations,
      exec: 'loginAndShop',
      startTime: nopCommerceConfig.loginAndShop.startTime,
    },
  },
  thresholds: {
    http_req_duration: nopCommerceConfig.thresholds.httpReqDuration,
    http_req_failed: nopCommerceConfig.thresholds.httpReqFailed,
  },
};

export function setup() {
  const data = testRunner.setup();

  // Pre-generate accounts for login scenario
  const userGenerator = new UserDataGenerator(nopCommerceConfig);
  // We can pass null as httpClient, the service will instantiate a default one
  const registrationService = new NopCommerceRegistrationService(null, userGenerator);

  const accounts = [];
  // Ensure we have enough accounts for all VUs (or more)
  const accountsNeeded = nopCommerceConfig.loginAndShop.vus;

  console.log(`Setup: Generating and registering ${accountsNeeded} accounts...`);

  for (let i = 0; i < accountsNeeded; i++) {
    const user = userGenerator.generate();
    // Register the user
    const result = registrationService.registerUser(user);
    if (result.success) {
      accounts.push(user.toJSON());
    } else {
      console.error(`Setup: Failed to register user ${user.email}: ${result.error}`);
    }
  }

  console.log(`Setup: Successfully registered ${accounts.length} accounts.`);

  return {
    ...data,
    accounts: accounts
  };
}

export function teardown(data) {
  return testRunner.teardown(data);
}
