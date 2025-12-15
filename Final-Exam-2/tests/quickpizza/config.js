import { baseConfig } from '../../src/core/config/baseConfig.js';

export const quickPizzaConfig = {
  ...baseConfig,
  application: {
    ...baseConfig.application,
    baseUrl: __ENV.BASE_URL || 'https://quickpizza.grafana.com/api',
  },

  // Final exam 2 requirements:
  // Part 1: 5 concurrent users register, 5 iterations total
  registration: {
    vus: 5,
    iterations: 5,
  },
  
  // Part 2: 10 concurrent users login, order, rate, logout
  // Rate of 5 iterations per second, loading 30 seconds
  orderAndRate: {
    vus: 10,
    rate: 5, // 5 iterations per second
    timeUnit: '1s',
    duration: '30s',
  },

  // Default credentials for login (as per K6 reference)
  credentials: {
    username: __ENV.QUICKPIZZA_USERNAME || 'default',
    password: __ENV.QUICKPIZZA_PASSWORD || '12345678',
  },

  endpoints: {
    register: '/users',
    login: '/users/token/login',
    logout: '/users/token/logout',
    order: '/pizza',
    rate: '/ratings',
  },

  delays: {
    ...baseConfig.delays,
    afterOrder: 1,
    afterRate: 1,
  },
};

