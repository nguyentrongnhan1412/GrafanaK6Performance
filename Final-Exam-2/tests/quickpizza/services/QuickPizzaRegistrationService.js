import { BaseRegistrationService } from '../../../src/core/services/BaseRegistrationService.js';
import { quickPizzaConfig } from '../config.js';
import { Logger } from '../../../src/utils/logger.js';

export class QuickPizzaRegistrationService extends BaseRegistrationService {
  constructor(httpClient = null, userGenerator = null) {
    const serviceConfig = {
      endpoints: quickPizzaConfig.endpoints,
      application: quickPizzaConfig.application,
      delays: quickPizzaConfig.delays,
    };
    super(serviceConfig, userGenerator, httpClient);
    this.fullConfig = quickPizzaConfig;
    this.logger = new Logger('QuickPizzaRegistrationService');
  }

  registerUser(user = null) {
    if (!user && this.userGenerator) {
      user = this.userGenerator.generate();
    }

    if (!user) {
      this.logger.error('No user provided and no userGenerator available');
      return {
        success: false,
        error: 'No user data available',
      };
    }

    this.logger.info(`Attempting registration for: ${user.email}`);

    try {
      const registerUrl = this.config.endpoints.register || '/users';
      // QuickPizza API expects JSON format with username and password
      const payload = {
        username: user.email,
        password: user.password,
      };
      
      const response = this.httpClient.post(registerUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const success = response.isSuccess && this._validateRegistrationResponse(response);
      
      if (success) {
        this.logger.info(`Registration successful for: ${user.email}`);
      } else {
        this.logger.warn(`Registration failed for: ${user.email} - Status: ${response.status}. Response: ${response.body?.substring(0, 200)}`);
      }

      return {
        success,
        response,
        user,
      };
    } catch (error) {
      this.logger.error(`Registration error for: ${user.email}`, error);
      return {
        success: false,
        error: error.toString(),
        user,
      };
    }
  }

  _validateRegistrationResponse(response) {
    return response.status >= 200 && response.status < 400;
  }
}

