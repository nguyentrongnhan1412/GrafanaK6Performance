import { BaseRegistrationService } from '../../../src/core/services/BaseRegistrationService.js';
import { nopCommerceConfig } from '../config.js';
import { Logger } from '../../../src/utils/logger.js';
import { sleep } from 'k6';

export class NopCommerceRegistrationService extends BaseRegistrationService {
  constructor(httpClient = null, userGenerator = null) {
    const serviceConfig = {
      endpoints: nopCommerceConfig.endpoints,
      application: nopCommerceConfig.application,
      delays: nopCommerceConfig.delays,
    };
    super(serviceConfig, userGenerator, httpClient);
    this.logger = new Logger('NopCommerceRegistrationService');
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
      const registerPageUrl = this.config.endpoints.register || '/register';
      const registerPageResponse = this.httpClient.get(registerPageUrl, {}, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!registerPageResponse.isSuccess) {
        this.logger.warn(`Failed to load registration page: ${registerPageResponse.status}`);
        return {
          success: false,
          error: `Failed to load registration page: ${registerPageResponse.status}`,
          user,
        };
      }

      const formToken = this.httpClient.extractFormToken(registerPageResponse.body);

      const payload = this._buildRegistrationPayload(user);
      if (formToken) {
        payload.__RequestVerificationToken = formToken;
      }

      const response = this.httpClient.post(registerPageUrl, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': this.httpClient.buildUrl(registerPageUrl),
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
    if (response.status >= 300 && response.status < 400) {
      return true;
    }
    
    if (response.status >= 200 && response.status < 300) {
      const body = (response.body || '').toLowerCase();
      const url = (response.url || '').toLowerCase();
      
      if (url.includes('/registerresult')) {
        if (body.includes('your registration completed') || 
            body.includes('thank you for registering') || 
            body.includes('registration completed') ||
            body.includes('successfully registered') ||
            body.includes('registration result') && body.includes('success') ||
            body.includes('registration-result-page') && !body.includes('error')) {
          return true;
        }
        if (body.includes('email already exists') || 
            body.includes('the email is already registered') ||
            body.includes('validation-summary-errors') ||
            body.includes('field-validation-error') ||
            body.includes('registration failed') ||
            body.includes('error')) {
          return false;
        }
        return true;
      }
      
      if (body.includes('your registration completed') || 
          body.includes('thank you for registering') || 
          body.includes('registration completed') ||
          body.includes('successfully registered') ||
          (body.includes('registration result') && body.includes('success'))) {
        return true;
      }
      
      if (body.includes('email already exists') || 
          body.includes('the email is already registered') ||
          body.includes('validation-summary-errors') ||
          body.includes('field-validation-error') ||
          body.includes('validation-summary') ||
          (body.includes('error') && (body.includes('email') || body.includes('password')))) {
        return false;
      }
      
      if (body.includes('name="email"') || 
          body.includes('id="email"') ||
          body.includes('registerform') ||
          (body.includes('registration') && body.includes('form'))) {
        return false;
      }
      
      return false;
    }
    
    return false;
  }
}

