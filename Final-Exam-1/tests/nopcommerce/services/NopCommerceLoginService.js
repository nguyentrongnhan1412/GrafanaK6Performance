import { BaseLoginService } from '../../../src/core/services/BaseLoginService.js';
import { nopCommerceConfig } from '../config.js';

export class NopCommerceLoginService extends BaseLoginService {
  constructor(httpClient = null) {
    const serviceConfig = {
      endpoints: nopCommerceConfig.endpoints,
      application: nopCommerceConfig.application,
      delays: nopCommerceConfig.delays,
    };
    super(serviceConfig, httpClient);
  }
}

