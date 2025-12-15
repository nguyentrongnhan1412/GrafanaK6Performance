export class Logger {
  constructor(context = '') {
    this.context = context;
  }

  info(message, data = {}) {
    const prefix = this.context ? `[${this.context}]` : '';
    console.log(`${prefix} INFO: ${message}`, Object.keys(data).length > 0 ? JSON.stringify(data) : '');
  }

  error(message, error = null) {
    const prefix = this.context ? `[${this.context}]` : '';
    console.error(`${prefix} ERROR: ${message}`, error ? error.toString() : '');
  }

  warn(message, data = {}) {
    const prefix = this.context ? `[${this.context}]` : '';
    console.warn(`${prefix} WARN: ${message}`, Object.keys(data).length > 0 ? JSON.stringify(data) : '');
  }

  debug(message, data = {}) {
    if (__ENV.DEBUG === 'true') {
      const prefix = this.context ? `[${this.context}]` : '';
      console.log(`${prefix} DEBUG: ${message}`, Object.keys(data).length > 0 ? JSON.stringify(data) : '');
    }
  }
}
