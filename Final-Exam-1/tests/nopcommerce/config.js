import { baseConfig } from '../../src/core/config/baseConfig.js';

export const nopCommerceConfig = {
  ...baseConfig,
  application: {
    ...baseConfig.application,
    baseUrl: __ENV.BASE_URL || 'http://localhost:5000',
  },

  registration: {
    vus: 5,
    rampUpDuration: '10s',
    duration: '1m',
    rampDownDuration: '10s',
  },

  loginAndShop: {
    vus: 10,
    iterations: 5,
    startTime: '15s',
  },

  endpoints: {
    register: '/register',
    login: '/login',
    logout: '/logout',
    product: '/product',
    addToCart: '/addproducttocart/details',
  },
  categories: ['', '/computers', '/electronics', '/apparel', '/books', '/digital-downloads'],
  defaultProductIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  addToCartProbability: 0.7,

  delays: {
    ...baseConfig.delays,
    browseMin: 1,
    browseMax: 3,
    productViewMin: 1,
    productViewMax: 2,
    afterAddToCart: 1,
  },
};

