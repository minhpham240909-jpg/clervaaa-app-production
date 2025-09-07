import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  keyGenerator?: (_req: NextRequest) => string;
  onLimitReached?: (_req: NextRequest) => NextResponse;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  handler: (_req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let context: any = {};
    
    try {
      context = logger.logRequest(req);
    } catch (error) {
      // Fallback if logger fails
      context = { requestId: 'fallback-id' };
    }
    
    try {
      // Generate key for rate limiting
      const key = config.keyGenerator 
        ? config.keyGenerator(req)
        : `${req.ip || 'unknown'}:${new URL(req.url).pathname}`;
      
      const now = Date.now();
      
      // Clean up expired entries
      for (const [mapKey, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
          rateLimitStore.delete(mapKey);
        }
      }
      
      // Get current rate limit info
      let rateLimitInfo = rateLimitStore.get(key);
      
      if (!rateLimitInfo || rateLimitInfo.resetTime < now) {
        // Initialize or reset the rate limit info
        rateLimitInfo = {
          count: 0,
          resetTime: now + config.windowMs
        };
        rateLimitStore.set(key, rateLimitInfo);
      }
      
      // Check if rate limit would be exceeded
      if (rateLimitInfo.count >= config.maxRequests) {
        try {
          logger.warn('Rate limit exceeded', undefined, {
            ...context,
            rateLimitKey: key,
            requestCount: rateLimitInfo.count,
            maxRequests: config.maxRequests,
            resetTime: rateLimitInfo.resetTime
          });
        } catch (error) {
          // Ignore logger errors
        }
        
        if (config.onLimitReached) {
          return config.onLimitReached(req);
        }
        
        const resetInSeconds = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            message: config.message || `Too many requests. Try again in ${resetInSeconds} seconds.`,
            retryAfter: resetInSeconds
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
              'Retry-After': resetInSeconds.toString()
            }
          }
        );
      }
      
      // Increment count after passing the check
      rateLimitInfo.count++;
      rateLimitStore.set(key, rateLimitInfo);
      
      // Call handler and add rate limit headers
      const response = await handler(req);
      const remaining = Math.max(0, config.maxRequests - rateLimitInfo.count);
      
      // Create new headers including rate limit headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-RateLimit-Limit', config.maxRequests.toString());
      newHeaders.set('X-RateLimit-Remaining', remaining.toString());
      newHeaders.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
      
      // Add rate limit headers to the existing NextResponse
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
      return response;
      
    } catch (error) {
      try {
        logger.error('Rate limit middleware error', error instanceof Error ? error : new Error(String(error)), context);
      } catch (logError) {
        // Ignore logger errors
      }
      return await handler(req); // Continue with request on middleware error
    }
  };
}

/**
 * Common rate limit configurations
 */
export const RateLimitConfigs = {
  // Strict rate limiting for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again later.'
  },
  
  // Moderate rate limiting for API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many API requests. Please slow down.'
  },
  
  // Lenient rate limiting for general endpoints
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please try again later.'
  },
  
  // Very strict for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many sensitive operations. Please wait before trying again.'
  }
};

/**
 * Pre-configured rate limiters
 */
export const authRateLimit = (handler: (_req: NextRequest) => Promise<NextResponse>) =>
  withRateLimit(handler, RateLimitConfigs.auth);

export const apiRateLimit = (handler: (_req: NextRequest) => Promise<NextResponse>) =>
  withRateLimit(handler, RateLimitConfigs.api);

export const generalRateLimit = (handler: (_req: NextRequest) => Promise<NextResponse>) =>
  withRateLimit(handler, RateLimitConfigs.general);

export const sensitiveRateLimit = (handler: (_req: NextRequest) => Promise<NextResponse>) =>
  withRateLimit(handler, RateLimitConfigs.sensitive);

// Export store management for testing
export const clearRateLimitStore = () => rateLimitStore.clear();
export const getRateLimitStore = () => rateLimitStore;