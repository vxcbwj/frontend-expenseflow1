/**
 * Production-safe logger utility
 * Logs are suppressed in production builds
 */

const isDev = !import.meta.env.PROD;

const logger = {
  log: (message: string, data?: any) => {
    if (isDev) {
      console.log(message, data);
    }
  },
  error: (message: string, data?: any) => {
    if (isDev) {
      console.error(message, data);
    }
  },
  warn: (message: string, data?: any) => {
    if (isDev) {
      console.warn(message, data);
    }
  },
  debug: (message: string, data?: any) => {
    if (isDev) {
      console.debug(message, data);
    }
  },
};

export default logger;
