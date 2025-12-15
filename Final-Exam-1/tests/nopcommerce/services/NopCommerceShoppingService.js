import { sleep } from 'k6';
import { nopCommerceConfig } from '../config.js';
import { HttpClient } from '../../../src/utils/httpClient.js';
import { Logger } from '../../../src/utils/logger.js';

export class NopCommerceShoppingService {
  constructor(httpClient = null) {
    this.config = nopCommerceConfig;
    this.httpClient = httpClient || new HttpClient(nopCommerceConfig.application.baseUrl);
    this.logger = new Logger('NopCommerceShoppingService');
  }

  shop() {
    try {
      const category = this.config.categories[Math.floor(Math.random() * this.config.categories.length)];
      const browseResponse = this.httpClient.get(category || '/');
      
      if (!browseResponse.isSuccess) {
        this.logger.warn(`Failed to browse category: ${category}`);
        return { success: false };
      }

      sleep(this.config.delays.browseMin + Math.random() * (this.config.delays.browseMax - this.config.delays.browseMin));

      const productId = this.config.defaultProductIds[Math.floor(Math.random() * this.config.defaultProductIds.length)];
      const productResponse = this.httpClient.get(`${this.config.endpoints.product}/${productId}`);

      if (!productResponse.isSuccess) {
        this.logger.warn(`Failed to view product: ${productId}`);
        return { success: false };
      }

      sleep(this.config.delays.productViewMin + Math.random() * (this.config.delays.productViewMax - this.config.delays.productViewMin));

      if (Math.random() < this.config.addToCartProbability) {
        const addToCartResponse = this.httpClient.post(this.config.endpoints.addToCart, {
          productId: productId,
          quantity: 1,
        });

        if (addToCartResponse.isSuccess) {
          this.logger.info(`Added product ${productId} to cart`);
          sleep(this.config.delays.afterAddToCart);
        } else {
          this.logger.warn(`Failed to add product ${productId} to cart`);
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Shopping error', error);
      return { success: false, error: error.toString() };
    }
  }
}

