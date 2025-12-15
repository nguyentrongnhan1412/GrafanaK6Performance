import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { User } from '../../models/User.js';

export class UserDataGenerator {
  constructor(config) {
    this.config = config;
  }

  generate() {
    const timestamp = Date.now();
    const randomStr = randomString(8);
    const userConfig = this.config.userData;

    // For QuickPizza, generate shorter usernames to meet API requirements
    let email;
    if (this.config.application?.baseUrl?.includes('quickpizza')) {
      // Use shorter format: user + 6 char random string (max ~20 chars total)
      const shortRandom = randomString(6);
      email = `user${shortRandom}@${userConfig.emailDomain}`;
    } else {
      // Use full format for other applications
      email = `testuser${timestamp}${randomStr}@${userConfig.emailDomain}`;
    }

    return new User({
      FirstName: `${userConfig.firstNamePrefix}${randomStr}`,
      LastName: `${userConfig.lastNamePrefix}${randomStr}`,
      Email: email,
      Password: this.config.accounts.defaultPassword,
      ConfirmPassword: this.config.accounts.defaultPassword,
      Gender: userConfig.defaultGender,
      DateOfBirthDay: userConfig.defaultBirthDay,
      DateOfBirthMonth: userConfig.defaultBirthMonth,
      DateOfBirthYear: userConfig.defaultBirthYear,
    });
  }
}

