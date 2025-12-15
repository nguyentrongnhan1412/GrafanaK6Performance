import { QuickPizzaRegistrationService } from '../services/QuickPizzaRegistrationService.js';
import { UserDataGenerator } from '../../../src/core/helpers/UserDataGenerator.js';
import { HttpClient } from '../../../src/utils/httpClient.js';
import { Logger } from '../../../src/utils/logger.js';
import { quickPizzaConfig } from '../config.js';

const logger = new Logger('RegisterScenario');

export function register() {
  // Create HttpClient for registration (without token)
  const httpClient = new HttpClient(quickPizzaConfig.application.baseUrl);
  
  // Register a new user
  const userGenerator = new UserDataGenerator(quickPizzaConfig);
  const registrationService = new QuickPizzaRegistrationService(httpClient, userGenerator);
  const registrationResult = registrationService.registerUser();
  
  if (!registrationResult.success || !registrationResult.user) {
    logger.error(`VU ${__VU} registration failed`);
    return;
  }
  
  logger.info(`VU ${__VU} registered user: ${registrationResult.user.email}`);
}

