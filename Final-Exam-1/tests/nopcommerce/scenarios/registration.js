import { NopCommerceRegistrationService } from '../services/NopCommerceRegistrationService.js';
import { UserDataGenerator } from '../../../src/core/helpers/UserDataGenerator.js';
import { BaseRegistrationScenario } from '../../../src/core/scenarios/BaseRegistrationScenario.js';
import { nopCommerceConfig } from '../config.js';

const userGenerator = new UserDataGenerator(nopCommerceConfig);
const registrationService = new NopCommerceRegistrationService(null, userGenerator);
const scenario = new BaseRegistrationScenario(registrationService, nopCommerceConfig);

export function registerUser() {
  scenario.execute();
}

