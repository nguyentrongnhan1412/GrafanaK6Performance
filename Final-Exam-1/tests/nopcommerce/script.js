import { nopCommerceConfig } from './config.js';
import { registerUser as registerUserScenario } from './scenarios/registration.js';
import { loginAndShop as loginAndShopScenario } from './scenarios/loginAndShop.js';
import { BaseTestRunner } from '../../src/core/runners/BaseTestRunner.js';
import { initializeScript } from '../../src/core/helpers/scriptInitializer.js';

initializeScript();
const testRunner = new BaseTestRunner(nopCommerceConfig);

export function registerUser() {
  registerUserScenario();
}

export function loginAndShop() {
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
  return testRunner.setup();
}

export function teardown(data) {
  return testRunner.teardown(data);
}
