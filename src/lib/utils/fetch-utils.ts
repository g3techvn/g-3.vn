/**
 * Custom fetch function that handles SSL verification in development
 */
export async function safeFetch(url: string, options: RequestInit = {}) {
  // Add SSL verification bypass for development
  if (process.env.NODE_ENV === 'development') {
    try {
      // Only import https in development and server-side
      if (typeof window === 'undefined') {
        const https = require('https');
        options.agent = new https.Agent({
          rejectUnauthorized: false
        });
      }
    } catch (error) {
      console.warn('Failed to create https agent:', error);
    }
  }

  return fetch(url, options);
}

/**
 * Get fetch configuration for development environment
 */
export function getDevFetchConfig(): RequestInit {
  if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
    try {
      const https = require('https');
      return {
        agent: new https.Agent({
          rejectUnauthorized: false
        })
      };
    } catch (error) {
      console.warn('Failed to create https agent:', error);
    }
  }
  return {};
} 