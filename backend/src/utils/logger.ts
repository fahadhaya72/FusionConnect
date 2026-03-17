interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  error(message: string, meta?: any): void {
    const formatted = this.formatMessage('ERROR', message, meta);
    if (this.isProduction) {
      console.error(formatted);
    } else {
      console.error(formatted);
    }
  }

  warn(message: string, meta?: any): void {
    const formatted = this.formatMessage('WARN', message, meta);
    if (this.isProduction) {
      console.warn(formatted);
    } else {
      console.warn(formatted);
    }
  }

  info(message: string, meta?: any): void {
    const formatted = this.formatMessage('INFO', message, meta);
    if (this.isProduction) {
      console.log(formatted);
    } else {
      console.log(formatted);
    }
  }

  debug(message: string, meta?: any): void {
    if (!this.isProduction) {
      const formatted = this.formatMessage('DEBUG', message, meta);
      console.log(formatted);
    }
  }
}

const logger = new Logger();
export default logger;
