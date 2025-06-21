import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// API Security Configuration
const API_SECURITY_CONFIG = {
  // Allowed origins for CORS
  ALLOWED_ORIGINS: [
    'https://g-3.vn',
    'https://www.g-3.vn',
    'https://admin.g-3.vn',
    ...(process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000'] 
      : []
    ),
  ],
  
  // Allowed methods
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allowed headers
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Version',
    'X-Client-Version',
    'X-Device-ID',
    'X-Session-ID',
  ],
  
  // API version configuration
  SUPPORTED_VERSIONS: ['v1', 'v2'],
  DEFAULT_VERSION: 'v2',
  DEPRECATED_VERSIONS: ['v1'],
  
  // Rate limiting per API version
  VERSION_RATE_LIMITS: {
    v1: { requests: 50, window: 60 }, // 50 requests per minute (deprecated)
    v2: { requests: 100, window: 60 }, // 100 requests per minute (current)
  } as Record<string, { requests: number; window: number }>,
  
  // Request size limits (in bytes)
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_JSON_SIZE: 1 * 1024 * 1024, // 1MB for JSON
  MAX_FORM_SIZE: 5 * 1024 * 1024, // 5MB for form data
};

// Common validation schemas
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).optional(),
  }),
  
  // Search
  search: z.object({
    q: z.string().min(1).max(100),
    category: z.string().optional(),
    sort: z.enum(['name', 'price', 'created_at', 'updated_at']).optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  // Product filters
  productFilters: z.object({
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    brandId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
  }),
  
  // Order validation
  orderCreate: z.object({
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().min(1).max(100),
      price: z.number().min(0),
    })).min(1).max(50),
    shippingAddress: z.object({
      name: z.string().min(1).max(100),
      phone: z.string().regex(/^[0-9+\-\s()]{10,15}$/),
      address: z.string().min(10).max(500),
      city: z.string().min(1).max(100),
      district: z.string().min(1).max(100),
      ward: z.string().min(1).max(100),
    }),
    paymentMethod: z.enum(['cod', 'bank_transfer', 'credit_card']),
    notes: z.string().max(500).optional(),
  }),
  
  // User validation
  userUpdate: z.object({
    name: z.string().min(1).max(100).optional(),
    phone: z.string().regex(/^[0-9+\-\s()]{10,15}$/).optional(),
    email: z.string().email().optional(),
    avatar: z.string().url().optional(),
  }),
  
  // Admin validation
  adminProductCreate: z.object({
    name: z.string().min(1).max(200),
    description: z.string().min(10).max(5000),
    price: z.number().min(0),
    comparePrice: z.number().min(0).optional(),
    sku: z.string().min(1).max(50),
    stock: z.number().min(0),
    categoryId: z.string().uuid(),
    brandId: z.string().uuid(),
    images: z.array(z.string().url()).min(1).max(10),
    specifications: z.record(z.string()).optional(),
    tags: z.array(z.string()).max(20).optional(),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
  }),
};

// Request validation middleware
export class RequestValidator {
  static validate<T>(schema: z.ZodSchema<T>) {
    return async (request: NextRequest): Promise<{
      success: boolean;
      data?: T;
      errors?: z.ZodError;
    }> => {
      try {
        let body: any = {};
        
        // Parse request body based on content type
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          try {
            body = await request.json();
          } catch (error) {
            return {
              success: false,
              errors: new z.ZodError([{
                code: 'custom',
                message: 'Invalid JSON format',
                path: ['body'],
              }]),
            };
          }
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          body = Object.fromEntries(formData.entries());
        }
        
        // Add query parameters
        const url = new URL(request.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());
        
        // Merge body and query params
        const requestData = { ...body, ...queryParams };
        
        // Validate against schema
        const result = schema.safeParse(requestData);
        
        if (result.success) {
          return {
            success: true,
            data: result.data,
          };
        } else {
          return {
            success: false,
            errors: result.error,
          };
        }
      } catch (error) {
        return {
          success: false,
          errors: new z.ZodError([{
            code: 'custom',
            message: 'Request validation failed',
            path: ['request'],
          }]),
        };
      }
    };
  }
  
  // Validate request size
  static async validateRequestSize(request: NextRequest): Promise<boolean> {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json') && size > API_SECURITY_CONFIG.MAX_JSON_SIZE) {
        return false;
      }
      
      if (contentType.includes('multipart/form-data') && size > API_SECURITY_CONFIG.MAX_FORM_SIZE) {
        return false;
      }
      
      if (size > API_SECURITY_CONFIG.MAX_REQUEST_SIZE) {
        return false;
      }
    }
    
    return true;
  }
  
  // Sanitize input data
  static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      // Basic XSS prevention
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (Array.isArray(data)) {
      return data.map(item => RequestValidator.sanitizeInput(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = RequestValidator.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return data;
  }
}

// CORS handler with enhanced security
export class CORSHandler {
  static getOrigin(request: NextRequest): string | null {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    // Check origin first
    if (origin && API_SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin)) {
      return origin;
    }
    
    // Fallback to referer for same-origin requests
    if (!origin && referer) {
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
        
        if (API_SECURITY_CONFIG.ALLOWED_ORIGINS.includes(refererOrigin)) {
          return refererOrigin;
        }
      } catch (error) {
        console.warn('Invalid referer URL:', referer);
      }
    }
    
    return null;
  }
  
  static createCORSHeaders(origin: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': API_SECURITY_CONFIG.ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Headers': API_SECURITY_CONFIG.ALLOWED_HEADERS.join(', '),
      'Access-Control-Max-Age': '86400', // 24 hours
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin',
    };
    
    if (origin) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
    
    return headers;
  }
  
  static handlePreflightRequest(request: NextRequest): NextResponse {
    const origin = CORSHandler.getOrigin(request);
    const headers = CORSHandler.createCORSHeaders(origin);
    
    // Check if method is allowed
    const requestedMethod = request.headers.get('access-control-request-method');
    if (requestedMethod && !API_SECURITY_CONFIG.ALLOWED_METHODS.includes(requestedMethod)) {
      return new NextResponse('Method not allowed', { status: 405, headers });
    }
    
    // Check if headers are allowed
    const requestedHeaders = request.headers.get('access-control-request-headers');
    if (requestedHeaders) {
      const headers_list = requestedHeaders.split(',').map(h => h.trim().toLowerCase());
      const allowed_headers = API_SECURITY_CONFIG.ALLOWED_HEADERS.map(h => h.toLowerCase());
      
      for (const header of headers_list) {
        if (!allowed_headers.includes(header)) {
          return new NextResponse('Header not allowed', { status: 403, headers });
        }
      }
    }
    
    return new NextResponse(null, { status: 200, headers });
  }
}

// API versioning handler
export class APIVersionHandler {
  static getVersion(request: NextRequest): string {
    // Check header first
    const headerVersion = request.headers.get('x-api-version');
    if (headerVersion && API_SECURITY_CONFIG.SUPPORTED_VERSIONS.includes(headerVersion)) {
      return headerVersion;
    }
    
    // Check URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    
    for (const segment of pathSegments) {
      if (API_SECURITY_CONFIG.SUPPORTED_VERSIONS.includes(segment)) {
        return segment;
      }
    }
    
    // Return default version
    return API_SECURITY_CONFIG.DEFAULT_VERSION;
  }
  
  static isVersionDeprecated(version: string): boolean {
    return API_SECURITY_CONFIG.DEPRECATED_VERSIONS.includes(version);
  }
  
  static getVersionRateLimit(version: string): { requests: number; window: number } {
    return API_SECURITY_CONFIG.VERSION_RATE_LIMITS[version] || 
           API_SECURITY_CONFIG.VERSION_RATE_LIMITS[API_SECURITY_CONFIG.DEFAULT_VERSION];
  }
  
  static addVersionHeaders(response: NextResponse, version: string): NextResponse {
    response.headers.set('X-API-Version', version);
    response.headers.set('X-Supported-Versions', API_SECURITY_CONFIG.SUPPORTED_VERSIONS.join(', '));
    
    if (APIVersionHandler.isVersionDeprecated(version)) {
      response.headers.set('X-API-Deprecated', 'true');
      response.headers.set('X-API-Sunset', '2024-12-31'); // Deprecation date
      response.headers.set('Warning', '299 - "This API version is deprecated"');
    }
    
    return response;
  }
}

// Security middleware factory
export function createAPISecurityMiddleware(options: {
  requireAuth?: boolean;
  allowedMethods?: string[];
  validationSchema?: z.ZodSchema<any>;
  rateLimit?: { requests: number; window: number };
}) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return CORSHandler.handlePreflightRequest(request);
      }
      
      // Check origin
      const origin = CORSHandler.getOrigin(request);
      if (!origin && request.headers.get('origin')) {
        return new NextResponse(
          JSON.stringify({ error: 'Origin not allowed' }),
          { status: 403 }
        );
      }
      
      // Check method
      const allowedMethods = options.allowedMethods || API_SECURITY_CONFIG.ALLOWED_METHODS;
      if (!allowedMethods.includes(request.method)) {
        const headers = CORSHandler.createCORSHeaders(origin);
        return new NextResponse(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers }
        );
      }
      
      // Check request size
      const isValidSize = await RequestValidator.validateRequestSize(request);
      if (!isValidSize) {
        const headers = CORSHandler.createCORSHeaders(origin);
        return new NextResponse(
          JSON.stringify({ error: 'Request size too large' }),
          { status: 413, headers }
        );
      }
      
      // API versioning
      const version = APIVersionHandler.getVersion(request);
      
      // Validate request if schema provided
      if (options.validationSchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const validator = RequestValidator.validate(options.validationSchema);
        const validation = await validator(request);
        
        if (!validation.success) {
          const headers = CORSHandler.createCORSHeaders(origin);
          return new NextResponse(
            JSON.stringify({
              error: 'Validation failed',
              details: validation.errors?.issues,
            }),
            { status: 400, headers }
          );
        }
        
        // Add validated data to request headers for downstream handlers
        const sanitizedData = RequestValidator.sanitizeInput(validation.data);
        request.headers.set('x-validated-data', JSON.stringify(sanitizedData));
      }
      
      // Add security headers to request for downstream handlers
      request.headers.set('x-api-version', version);
      request.headers.set('x-origin', origin || '');
      
      return null; // Continue to next middleware
    } catch (error) {
      console.error('API security middleware error:', error);
      
      return new NextResponse(
        JSON.stringify({ error: 'Internal security error' }),
        { status: 500 }
      );
    }
  };
}

// Response security enhancer
export function enhanceResponseSecurity(response: NextResponse, request: NextRequest): NextResponse {
  const origin = CORSHandler.getOrigin(request);
  const version = APIVersionHandler.getVersion(request);
  
  // Add CORS headers
  const corsHeaders = CORSHandler.createCORSHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add API version headers
  APIVersionHandler.addVersionHeaders(response, version);
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add response timestamp
  response.headers.set('X-Response-Time', new Date().toISOString());
  
  // Add rate limit info if available
  const rateLimitInfo = APIVersionHandler.getVersionRateLimit(version);
  response.headers.set('X-RateLimit-Limit', rateLimitInfo.requests.toString());
  
  return response;
}

// Error response helper
export function createSecureErrorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response = NextResponse.json(
    {
      error,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    },
    { status }
  );
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
}

export { API_SECURITY_CONFIG }; 