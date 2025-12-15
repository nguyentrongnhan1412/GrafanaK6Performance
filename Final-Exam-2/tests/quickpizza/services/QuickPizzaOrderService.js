import { HttpClient } from '../../../src/utils/httpClient.js';
import { Logger } from '../../../src/utils/logger.js';
import { quickPizzaConfig } from '../config.js';
import { sleep } from 'k6';

export class QuickPizzaOrderService {
  constructor(httpClient) {
    this.httpClient = httpClient;
    this.logger = new Logger('QuickPizzaOrderService');
    this.config = quickPizzaConfig;
  }

  orderAndRate() {
    // Step 1: Order a pizza
    const orderResult = this.orderPizza();
    
    if (!orderResult.success) {
      this.logger.error(`Failed to order pizza`);
      return;
    }

    sleep(1); // Delay between order and rating

    // Step 2: Rate the pizza - randomly choose "love it" or "no thanks"
    const pizzaId = orderResult.orderId;
    if (pizzaId) {
      // Randomly choose "love it" (5 stars) or "no thanks" (1 star)
      const rating = Math.random() < 0.5 ? 'love it' : 'no thanks';
      const stars = rating === 'love it' ? 5 : 1;
      const rateResult = this.ratePizza(pizzaId, rating, stars);
      
      if (!rateResult.success) {
        this.logger.error(`Failed to rate pizza`);
      }
    } else {
      this.logger.warn(`No pizza ID found in order response, skipping rating`);
    }
  }

  orderPizza() {
    this.logger.info(`Placing pizza order`);
    
    try {
      const orderUrl = this.config?.endpoints?.order || '/pizza';
      const payload = this._buildPizzaRequest();
      
      const response = this.httpClient.post(orderUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const success = response.isSuccess && response.status >= 200 && response.status < 400;
      let orderId = null;
      
      if (success) {
        try {
          const body = JSON.parse(response.body || '{}');
          // K6 reference checks for pizza.id
          orderId = body.pizza?.id || body.id || body.orderId || body.order?.id || null;
        } catch (e) {
          this.logger.warn('Could not parse order response');
        }
        this.logger.info(`Pizza order successful. Order ID: ${orderId || 'N/A'}`);
      } else {
        this.logger.warn(`Pizza order failed - Status: ${response.status}`);
      }

      return {
        success,
        orderId,
        response,
      };
    } catch (error) {
      this.logger.error(`Order error`, error);
      return {
        success: false,
        error: error.toString(),
      };
    }
  }

  ratePizza(orderId, rating, stars) {
    this.logger.info(`Rating pizza with: ${rating} (${stars} stars)`);
    
    try {
      const rateUrl = this.config?.endpoints?.rate || '/ratings';
      // Submit a rating with pizza_id and stars
      const payload = {
        pizza_id: orderId,
        stars: stars,
      };
      
      const response = this.httpClient.post(rateUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const success = response.isSuccess && response.status >= 200 && response.status < 400;
      
      if (success) {
        this.logger.info(`Rating successful: ${rating}`);
      } else {
        this.logger.warn(`Rating failed - Status: ${response.status}`);
      }

      return {
        success,
        response,
      };
    } catch (error) {
      this.logger.error(`Rating error`, error);
      return {
        success: false,
        error: error.toString(),
      };
    }
  }

  _buildPizzaRequest() {
    // Match the PizzaRequest structure from K6 reference
    // Ensure minNumberOfToppings <= maxNumberOfToppings
    const maxToppings = this._randomIntBetween(3, 10);
    const minToppings = this._randomIntBetween(1, Math.min(3, maxToppings));
    
    return {
      maxCaloriesPerSlice: this._randomIntBetween(300, 1000),
      mustBeVegetarian: Math.random() < 0.5,
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: maxToppings,
      minNumberOfToppings: minToppings,
      customName: '',
    };
  }

  _randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

