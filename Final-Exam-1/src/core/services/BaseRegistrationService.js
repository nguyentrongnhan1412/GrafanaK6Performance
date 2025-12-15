import { HttpClient } from '../../utils/httpClient.js';
import { Logger } from '../../utils/logger.js';
import { sleep } from 'k6';

export class BaseRegistrationService {
  constructor(serviceConfig, userGenerator = null, httpClient = null) {
    this.config = serviceConfig;
    this.userGenerator = userGenerator;
    this.httpClient = httpClient || new HttpClient(serviceConfig.application.baseUrl);
    this.logger = new Logger('BaseRegistrationService');
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
      const registerUrl = this.config.endpoints.register || '/register';
      const payload = this._buildRegistrationPayload(user);
      
      const response = this.httpClient.post(registerUrl, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const success = response.isSuccess && this._validateRegistrationResponse(response);
      
      if (success) {
        sleep(this.config.delays?.afterFormSubmit || 2);
        this.logger.info(`Registration successful for: ${user.email}`);
      } else {
        this.logger.warn(`Registration failed for: ${user.email} - Status: ${response.status}`);
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

  _buildRegistrationPayload(user) {
    return user.toRegistrationPayload();
  }

  _validateRegistrationResponse(response) {
    return response.status >= 200 && response.status < 400;
  }
}

