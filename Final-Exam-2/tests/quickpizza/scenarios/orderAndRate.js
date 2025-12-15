import { QuickPizzaLoginService } from '../services/QuickPizzaLoginService.js';
import { QuickPizzaOrderService } from '../services/QuickPizzaOrderService.js';
import { HttpClient } from '../../../src/utils/httpClient.js';
import { Logger } from '../../../src/utils/logger.js';
import { quickPizzaConfig } from '../config.js';

const logger = new Logger('OrderAndRateScenario');

export function orderAndRate() {
  // Create HttpClient for login (without token)
  const httpClient = new HttpClient(quickPizzaConfig.application.baseUrl);
  
  // Step 1: Login with default credentials (as per K6 reference)
  const loginService = new QuickPizzaLoginService(httpClient);
  const loginResult = loginService.login(
    quickPizzaConfig.credentials?.username || 'default',
    quickPizzaConfig.credentials?.password || '12345678'
  );

  if (!loginResult.success) {
    logger.error(`VU ${__VU} login failed`);
    return;
  }

  logger.info(`VU ${__VU} login successful`);

  // Step 2: Create HttpClient for order operations with token
  let orderHttpClient = httpClient;
  if (loginResult.token) {
    orderHttpClient = new HttpClient(quickPizzaConfig.application.baseUrl, loginResult.token);
    logger.info(`VU ${__VU} using token-based authentication`);
  }
  
  // Step 3: Order pizza and rate it
  const orderService = new QuickPizzaOrderService(orderHttpClient);
  orderService.orderAndRate();
  
  // Step 4: Logout (use authenticated client for logout)
  const logoutService = new QuickPizzaLoginService(orderHttpClient);
  logoutService.logout();
  logger.info(`VU ${__VU} logged out`);
}

