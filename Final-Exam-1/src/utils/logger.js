export class Logger {
  constructor(context = '') {
    this.context = context;
    this.prefix = context ? `[${context}]` : '';
  }

  info(message, data = {}) {
    const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
    console.log(`${this.prefix} INFO: ${message}`, dataStr);
  }

  error(message, error = null) {
    const errorStr = error ? error.toString() : '';
    console.error(`${this.prefix} ERROR: ${message}`, errorStr);
  }

  warn(message, data = {}) {
    const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
    console.warn(`${this.prefix} WARN: ${message}`, dataStr);
  }

  debug(message, data = {}) {
    if (__ENV.DEBUG === 'true') {
      const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
      console.log(`${this.prefix} DEBUG: ${message}`, dataStr);
    }
  }
}
