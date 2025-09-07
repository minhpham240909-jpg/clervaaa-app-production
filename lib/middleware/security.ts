import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';
import { APIError } from '@/lib/api-utils';

// Security configuration
const SECURITY_CONFIG = {
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  maxHeaderSize: 8 * 1024, // 8KB
  blockedUserAgents: [
    /bot/i,
    /crawler/i,
    /spider/i,
    // Add more patterns as needed
  ],
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yourdomain.com', // Replace with your actual domain
  ],
  rateLimitStore: new Map<string, { count: number; resetTime: number }>(),
};

/**
 * CORS middleware with configurable origins
 */
export function withCORS(allowedOrigins: string[] = SECURITY_CONFIG.allowedOrigins) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      const origin = request.headers.get('origin');
      const response = await handler(request);

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        const corsResponse = new NextResponse(null, { status: 200 });
        
        if (origin && allowedOrigins.includes(origin)) {
          corsResponse.headers.set('Access-Control-Allow-Origin', origin);
        }
        
        corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        corsResponse.headers.set('Access-Control-Allow-Credentials', 'true');
        corsResponse.headers.set('Access-Control-Max-Age', '86400');
        
        return corsResponse;
      }

      // Add CORS headers to actual response
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return response;
    };
  };
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders() {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      const response = await handler(request);

      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // Content Security Policy (adjust based on your needs)
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
      );

      // Remove server info
      response.headers.delete('X-Powered-By');
      response.headers.delete('Server');

      return response;
    };
  };
}

/**
 * Request size validation middleware
 */
export function withRequestSizeLimit(maxSize: number = SECURITY_CONFIG.maxRequestSize) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      // Check content-length header
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > maxSize) {
        logger.warn('Request too large', {
          size: contentLength,
          maxSize,
          url: request.url,
          method: request.method,
        });
        
        monitoring.recordSecurityEvent('REQUEST_TOO_LARGE', 'medium', {
          size: contentLength,
          maxSize,
          url: request.url,
        });

        throw new APIError(413, 'Request entity too large', 'REQUEST_TOO_LARGE');
      }

      // Check header sizes
      let totalHeaderSize = 0;
      request.headers.forEach((value, key) => {
        totalHeaderSize += key.length + value.length;
      });

      if (totalHeaderSize > SECURITY_CONFIG.maxHeaderSize) {
        logger.warn('Headers too large', {
          size: totalHeaderSize,
          maxSize: SECURITY_CONFIG.maxHeaderSize,
          url: request.url,
        });

        monitoring.recordSecurityEvent('HEADERS_TOO_LARGE', 'medium', {
          size: totalHeaderSize,
          maxSize: SECURITY_CONFIG.maxHeaderSize,
        });

        throw new APIError(431, 'Request header fields too large', 'HEADERS_TOO_LARGE');
      }

      return handler(request);
    };
  };
}

/**
 * User-Agent validation middleware
 */
export function withUserAgentValidation(blockedPatterns: RegExp[] = SECURITY_CONFIG.blockedUserAgents) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      const userAgent = request.headers.get('user-agent') || '';
      
      // Check if user agent matches blocked patterns
      const isBlocked = blockedPatterns.some(pattern => pattern.test(userAgent));
      
      if (isBlocked) {
        logger.warn('Blocked user agent', {
          userAgent,
          url: request.url,
          ip: request.ip || 'unknown',
        });

        monitoring.recordSecurityEvent('BLOCKED_USER_AGENT', 'low', {
          userAgent,
          url: request.url,
        });

        throw new APIError(403, 'Access denied', 'BLOCKED_USER_AGENT');
      }

      // Suspicious patterns check
      const suspiciousPatterns = [
        /curl/i,
        /wget/i,
        /python/i,
        /go-http/i,
        /java/i,
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
      
      if (isSuspicious) {
        logger.info('Suspicious user agent detected', {
          userAgent,
          url: request.url,
          ip: request.ip || 'unknown',
        });

        monitoring.recordSecurityEvent('SUSPICIOUS_USER_AGENT', 'low', {
          userAgent,
          url: request.url,
        });
      }

      return handler(request);
    };
  };
}

/**
 * IP-based rate limiting middleware
 */
export function withIPRateLimit(
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  store: Map<string, { count: number; resetTime: number }> = SECURITY_CONFIG.rateLimitStore
) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      const ip = request.ip || 
                 request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                 request.headers.get('x-real-ip') || 
                 'unknown';

      const now = Date.now();
      const key = `ip:${ip}`;
      const existing = store.get(key);

      if (!existing || existing.resetTime <= now) {
        store.set(key, { count: 1, resetTime: now + windowMs });
      } else if (existing.count >= limit) {
        logger.warn('Rate limit exceeded', {
          ip,
          limit,
          count: existing.count,
          url: request.url,
        });

        monitoring.recordSecurityEvent('RATE_LIMIT_EXCEEDED', 'medium', {
          ip,
          limit,
          count: existing.count,
          url: request.url,
        });

        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded', 
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((existing.resetTime - now) / 1000)
          },
          { status: 429 }
        );

        response.headers.set('Retry-After', Math.ceil((existing.resetTime - now) / 1000).toString());
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', existing.resetTime.toString());

        return response;
      } else {
        existing.count++;
      }

      const response = await handler(request);
      
      // Add rate limit headers
      const current = store.get(key);
      if (current) {
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', Math.max(0, limit - current.count).toString());
        response.headers.set('X-RateLimit-Reset', current.resetTime.toString());
      }

      return response;
    };
  };
}

/**
 * Request validation middleware for common attack patterns
 */
export function withRequestValidation() {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      const url = request.url;
      const method = request.method;

      // Check for common attack patterns in URL
      const maliciousPatterns = [
        /\.\./,                    // Path traversal
        /<script/i,               // XSS
        /union.*select/i,         // SQL injection
        /javascript:/i,           // JavaScript protocol
        /data:/i,                 // Data protocol (potentially dangerous)
        /%00/,                    // Null byte
        /\$\{/,                   // Template injection
        /{{.*}}/,                 // Template injection
      ];

      const isMalicious = maliciousPatterns.some(pattern => pattern.test(url));
      
      if (isMalicious) {
        logger.error('Malicious request detected', {
          url,
          method,
          ip: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        } as any);

        monitoring.recordSecurityEvent('MALICIOUS_REQUEST', 'high', {
          url,
          method,
          patterns: maliciousPatterns.filter((p: any) => p.test(url)).map((p: any) => p.toString()),
        });

        throw new APIError(400, 'Invalid request', 'MALICIOUS_REQUEST');
      }

      // Check request method
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
      if (!allowedMethods.includes(method)) {
        logger.warn('Invalid HTTP method', {
          method,
          url,
          ip: request.ip || 'unknown',
        });

        monitoring.recordSecurityEvent('INVALID_METHOD', 'low', {
          method,
          url,
        });

        throw new APIError(405, 'Method not allowed', 'INVALID_METHOD');
      }

      return handler(request);
    };
  };
}

/**
 * Comprehensive security middleware composer
 */
export function withSecurity(options: {
  cors?: boolean;
  corsOrigins?: string[];
  rateLimit?: { limit?: number; windowMs?: number };
  requestSizeLimit?: number;
  validateUserAgent?: boolean;
  validateRequests?: boolean;
} = {}) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    let secureHandler = handler;

    // Apply security middlewares in order
    if (options.validateRequests !== false) {
      secureHandler = withRequestValidation()(secureHandler);
    }

    if (options.validateUserAgent !== false) {
      secureHandler = withUserAgentValidation()(secureHandler);
    }

    if (options.requestSizeLimit !== undefined) {
      secureHandler = withRequestSizeLimit(options.requestSizeLimit)(secureHandler);
    }

    if (options.rateLimit !== undefined) {
      const rateLimitConfig = options.rateLimit || {};
      const { limit = 100, windowMs = 15 * 60 * 1000 } = rateLimitConfig;
      secureHandler = withIPRateLimit(limit, windowMs)(secureHandler);
    }

    if (options.cors !== false) {
      secureHandler = withCORS(options.corsOrigins)(secureHandler);
    }

    // Always add security headers
    secureHandler = withSecurityHeaders()(secureHandler);

    return secureHandler;
  };
}

/**
 * Clean up rate limit store periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of SECURITY_CONFIG.rateLimitStore.entries()) {
    if (value.resetTime <= now) {
      SECURITY_CONFIG.rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes