interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVEL: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

interface SecurityEvent {
  type: 'RATE_LIMIT_EXCEEDED' | 'VALIDATION_FAILED' | 'SUSPICIOUS_REQUEST' | 'API_ACCESS' | 'ORDER_CREATED';
  ip: string;
  userAgent?: string;
  endpoint: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
}

class SecurityLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private formatLog(level: string, message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data })
    };

    if (this.isDevelopment) {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
    } else {
      // In production, you would send this to your logging service
      // Examples: DataDog, LogRocket, Sentry, etc.
      console.log(JSON.stringify(logEntry));
    }
  }

  logSecurityEvent(event: SecurityEvent): void {
    const message = `Security Event: ${event.type} from IP ${event.ip} on ${event.endpoint}`;
    
    this.formatLog(LOG_LEVEL.WARN, message, {
      type: event.type,
      ip: event.ip,
      userAgent: event.userAgent,
      endpoint: event.endpoint,
      details: event.details,
      userId: event.userId,
      timestamp: event.timestamp
    });

    // In production, also send critical events to alerting system
    if (!this.isDevelopment && this.isCriticalEvent(event.type)) {
      this.sendAlert(event);
    }
  }

  logApiAccess(ip: string, endpoint: string, method: string, userAgent?: string, userId?: string): void {
    this.formatLog(LOG_LEVEL.INFO, `API Access: ${method} ${endpoint}`, {
      ip,
      endpoint,
      method,
      userAgent,
      userId,
      timestamp: new Date()
    });
  }

  logError(message: string, error: Error, context?: Record<string, unknown>): void {
    this.formatLog(LOG_LEVEL.ERROR, message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date()
    });
  }

  logWarning(message: string, context?: Record<string, unknown>): void {
    this.formatLog(LOG_LEVEL.WARN, message, {
      context,
      timestamp: new Date()
    });
  }

  logInfo(message: string, context?: Record<string, unknown>): void {
    this.formatLog(LOG_LEVEL.INFO, message, {
      context,
      timestamp: new Date()
    });
  }

  private isCriticalEvent(eventType: SecurityEvent['type']): boolean {
    return ['RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_REQUEST'].includes(eventType);
  }

  private sendAlert(event: SecurityEvent): void {
    // In production, integrate with alerting services like:
    // - Slack webhooks
    // - Email alerts
    // - PagerDuty
    // - Discord webhooks
    console.log(`🚨 CRITICAL SECURITY ALERT: ${event.type} from ${event.ip}`);
  }
}

// Singleton instance
export const securityLogger = new SecurityLogger();

// Helper functions for common logging patterns
export const logRateLimitExceeded = (ip: string, endpoint: string, userAgent?: string) => {
  securityLogger.logSecurityEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    ip,
    endpoint,
    userAgent,
    timestamp: new Date(),
    details: { reason: 'Too many requests' }
  });
};

export const logValidationFailed = (ip: string, endpoint: string, errors: string[], userAgent?: string) => {
  securityLogger.logSecurityEvent({
    type: 'VALIDATION_FAILED',
    ip,
    endpoint,
    userAgent,
    timestamp: new Date(),
    details: { validationErrors: errors }
  });
};

export const logOrderCreated = (ip: string, orderId: string, userId?: string, userAgent?: string) => {
  securityLogger.logSecurityEvent({
    type: 'ORDER_CREATED',
    ip,
    endpoint: '/api/orders',
    userAgent,
    userId,
    timestamp: new Date(),
    details: { orderId }
  });
};

export const logSuspiciousRequest = (ip: string, endpoint: string, reason: string, userAgent?: string) => {
  securityLogger.logSecurityEvent({
    type: 'SUSPICIOUS_REQUEST',
    ip,
    endpoint,
    userAgent,
    timestamp: new Date(),
    details: { reason }
  });
}; 