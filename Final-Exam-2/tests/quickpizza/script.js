import { quickPizzaConfig } from './config.js';
import { register as registerScenario } from './scenarios/register.js';
import { orderAndRate as orderAndRateScenario } from './scenarios/orderAndRate.js';
import { BaseTestRunner } from '../../src/core/runners/BaseTestRunner.js';
import { initializeScript } from '../../src/core/helpers/scriptInitializer.js';

initializeScript();
const testRunner = new BaseTestRunner(quickPizzaConfig);

export function register() {
  registerScenario();
}

export function orderAndRate() {
  orderAndRateScenario();
}

export const options = {
  scenarios: {
    // Part 1: 5 concurrent users register, 5 iterations total
    registration: {
      executor: 'shared-iterations',
      vus: quickPizzaConfig.registration.vus,
      iterations: quickPizzaConfig.registration.iterations,
      exec: 'register',
    },
    // Part 2: 10 concurrent users login, order, rate, logout
    // Rate of 5 iterations per second, loading 30 seconds
    orderAndRate: {
      executor: 'constant-arrival-rate',
      rate: quickPizzaConfig.orderAndRate.rate,
      timeUnit: quickPizzaConfig.orderAndRate.timeUnit,
      duration: quickPizzaConfig.orderAndRate.duration,
      preAllocatedVUs: quickPizzaConfig.orderAndRate.vus,
      maxVUs: quickPizzaConfig.orderAndRate.vus,
      exec: 'orderAndRate',
    },
  },
  thresholds: {
    http_req_duration: quickPizzaConfig.thresholds.httpReqDuration,
    http_req_failed: quickPizzaConfig.thresholds.httpReqFailed,
  },
};

export function setup() {
  return testRunner.setup();
}

export function teardown(data) {
  return testRunner.teardown(data);
}

