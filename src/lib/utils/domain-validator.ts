/**
 * Validates if a given hostname is allowed based on environment
 */
export function isAllowedDomain(hostname: string): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isValidDomain = hostname === process.env.NEXT_PUBLIC_APP_DOMAIN;

  return isValidDomain || (isDevelopment && isLocalhost);
}

/**
 * Validates if a request origin/referer is allowed
 */
export function validateRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (!origin && !referer) {
    // Allow requests without origin/referer in development
    return process.env.NODE_ENV === 'development';
  }

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (!isAllowedDomain(originUrl.hostname)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (!isAllowedDomain(refererUrl.hostname)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Gets the base URL for the current environment
 */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`;
}

/**
 * Validates and returns the full API URL
 */
export function getApiUrl(path: string): string {
  return `${getBaseUrl()}/api${path}`;
} 