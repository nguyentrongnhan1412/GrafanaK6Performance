import { BaseLoginService } from '../../../src/core/services/BaseLoginService.js';
import { quickPizzaConfig } from '../config.js';
import { Logger } from '../../../src/utils/logger.js';

export class QuickPizzaLoginService extends BaseLoginService {
  constructor(httpClient = null) {
    const serviceConfig = {
      endpoints: quickPizzaConfig.endpoints,
      application: quickPizzaConfig.application,
      delays: quickPizzaConfig.delays,
    };
    super(serviceConfig, httpClient);
    this.fullConfig = quickPizzaConfig;
    this.logger = new Logger('QuickPizzaLoginService');
  }

  login(email, password) {
    this.logger.info(`Attempting login for: ${email}`);
    
    try {
      const loginUrl = this.config.endpoints.login || '/users/token/login';
      
      // QuickPizza login uses JSON with username and password
      const payload = {
        username: email,
        password: password,
      };
      
      const response = this.httpClient.post(loginUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const success = response.isSuccess && this._validateLoginResponse(response);
      let token = null;
      
      if (success) {
        // Extract token from response body using JSON parsing
        try {
          const body = JSON.parse(response.body || '{}');
          token = body.token || null;
          
          if (!token) {
            this.logger.warn(`Login succeeded but no token found in response`);
          } else {
            this.logger.info(`Login successful for: ${email}`);
          }
        } catch (e) {
          this.logger.warn(`Failed to parse login response: ${e.message}`);
        }
      } else {
        this.logger.warn(`Login failed for: ${email} - Status: ${response.status}`);
      }

      return {
        success,
        response,
        email,
        token,
      };
    } catch (error) {
      this.logger.error(`Login error for: ${email}`, error);
      return {
        success: false,
        error: error.toString(),
        email,
        token: null,
      };
    }
  }

  _validateLoginResponse(response) {
    return response.status >= 200 && response.status < 400;
  }

  logout() {
    this.logger.info(`Attempting logout`);
    
    try {
      // QuickPizza logout endpoint (if available)
      const logoutUrl = this.config.endpoints.logout || '/users/token/logout';
      
      const response = this.httpClient.post(logoutUrl, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const success = response.isSuccess && response.status >= 200 && response.status < 400;
      
      if (success) {
        this.logger.info(`Logout successful`);
      } else {
        // Logout might not be critical, just log a warning
        this.logger.warn(`Logout returned status ${response.status}`);
      }

      return {
        success,
        response,
      };
    } catch (error) {
      this.logger.warn(`Logout error: ${error.message}`);
      return {
        success: false,
        error: error.toString(),
      };
    }
  }
}

