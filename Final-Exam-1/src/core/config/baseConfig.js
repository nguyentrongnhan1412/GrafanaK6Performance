export const baseConfig = {
  application: {
    timeout: parseInt(__ENV.TIMEOUT || '30000', 10),
  },

  thresholds: {
    httpReqDuration: ['p(95)<2000'],
    httpReqFailed: ['rate<0.1'],
  },

  accounts: {
    storageFile: __ENV.ACCOUNTS_FILE || 'accounts.json',
    defaultPassword: 'Test123456!',
  },

  userData: {
    firstNamePrefix: 'Test',
    lastNamePrefix: 'User',
    emailDomain: 'example.com',
    defaultGender: 'M',
    defaultBirthDay: '1',
    defaultBirthMonth: '1',
    defaultBirthYear: '1990',
  },

  delays: {
    afterPageLoad: 1,
    afterFormSubmit: 2,
    afterLogin: 2,
  },
};

