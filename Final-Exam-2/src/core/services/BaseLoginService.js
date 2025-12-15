import { HttpClient } from '../../utils/httpClient.js';
import { Logger } from '../../utils/logger.js';
import { sleep } from 'k6';

export class BaseLoginService {
  constructor(serviceConfig, httpClient = null) {
    this.config = serviceConfig;
    this.httpClient = httpClient || new HttpClient(serviceConfig.application.baseUrl);
    this.logger = new Logger('BaseLoginService');
  }

  login(email, password) {
    this.logger.info(`Attempting login for: ${email}`);
    
    try {
      const loginUrl = this.config.endpoints.login || '/login';
      const payload = this._buildLoginPayload(email, password);
      
      const response = this.httpClient.post(loginUrl, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const success = response.isSuccess && this._validateLoginResponse(response);
      
      if (success) {
        sleep(this.config.delays?.afterLogin || 1);
        this.logger.info(`Login successful for: ${email}`);
      } else {
        this.logger.warn(`Login failed for: ${email} - Status: ${response.status}`);
      }

      return {
        success,
        response,
        email,
      };
    } catch (error) {
      this.logger.error(`Login error for: ${email}`, error);
      return {
        success: false,
        error: error.toString(),
        email,
      };
    }
  }

  _buildLoginPayload(email, password) {
    return {
      Email: email,
      Password: password,
      RememberMe: false,
    };
  }

  _validateLoginResponse(response) {
    return response.status >= 200 && response.status < 400;
  }
}

