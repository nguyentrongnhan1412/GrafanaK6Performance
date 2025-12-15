import http from 'k6/http';
import { check } from 'k6';
import { Logger } from './logger.js';

export class HttpClient {
  constructor(baseUrl = null, token = null) {
    if (!baseUrl) {
      throw new Error('HttpClient requires a baseUrl parameter');
    }
    this.baseUrl = baseUrl;
    this.token = token;
    this.logger = new Logger('HttpClient');
    this.defaultHeaders = {
      'User-Agent': 'K6-LoadTest/1.0',
    };
    if (this.token) {
      this.defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  extractFormToken(htmlBody) {
    if (!htmlBody || typeof htmlBody !== 'string') {
      return null;
    }
    const tokenMatch = htmlBody.match(/name="__RequestVerificationToken"[^>]*value="([^"]*)"/);
    return tokenMatch ? tokenMatch[1] : null;
  }

  buildUrl(path) {
    return `${this.baseUrl}${path}`;
  }

  get(path, params = {}, options = {}) {
    const url = this.buildUrl(path);
    const mergedOptions = {
      ...options,
      headers: { ...this.defaultHeaders, ...(options.headers || {}) },
      tags: { name: `GET ${path}`, ...(options.tags || {}) },
      cookies: options.cookies || {},
    };

    const response = http.get(url, params, mergedOptions);
    return this._handleResponse(response, 'GET', path);
  }

  post(path, payload = {}, options = {}) {
    const url = this.buildUrl(path);
    const mergedOptions = {
      ...options,
      headers: { ...this.defaultHeaders, ...(options.headers || {}) },
      tags: { name: `POST ${path}`, ...(options.tags || {}) },
      cookies: options.cookies || {},
    };

    let finalPayload = payload;
    const contentType = mergedOptions.headers['Content-Type'] || '';
    
    if (typeof payload === 'string') {
      finalPayload = payload;
    } else if (contentType === 'application/json') {
      finalPayload = JSON.stringify(payload);
    } else if (contentType === 'application/x-www-form-urlencoded') {
      finalPayload = payload;
    }

    const response = http.post(url, finalPayload, mergedOptions);
    return this._handleResponse(response, 'POST', path);
  }

  _handleResponse(response, method, path) {
    const isSuccess = response.status >= 200 && response.status < 400;
    
    if (!isSuccess) {
      this.logger.warn(`${method} ${path} returned status ${response.status}`);
    }

    const body = response.body || '';
    return {
      ...response,
      isSuccess,
      formToken: this.extractFormToken(body),
    };
  }

  validateResponse(response, checks = {}) {
    const defaultChecks = {
      'status is success': (r) => r.status >= 200 && r.status < 400,
      ...checks,
    };
    return check(response, defaultChecks);
  }
}
