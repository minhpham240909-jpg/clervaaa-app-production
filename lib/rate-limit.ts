import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(private config: RateLimitConfig) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemaining(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return this.config.maxRequests;
    return Math.max(0, this.config.maxRequests - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record?.resetTime || Date.now() + this.config.windowMs;
  }

  getMessage(): string {
    return this.config.message || 'Rate limit exceeded';
  }

  getMaxRequests(): number {
    return this.config.maxRequests;
  }

  getWindowMs(): number {
    return this.config.windowMs;
  }
}

// Create rate limiters for different endpoints
const chatLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Too many chat requests. Please try again later.',
});

const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again later.',
});

const apiLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many API requests. Please try again later.',
});

export function withRateLimit(
  limiter: RateLimiter,
  handler: (_req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const identifier = req.ip || 'unknown';
    
    if (!limiter.isAllowed(identifier)) {
      return NextResponse.json(
        { error: limiter.getMessage() },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limiter.getMaxRequests().toString(),
            'X-RateLimit-Remaining': limiter.getRemaining(identifier).toString(),
            'X-RateLimit-Reset': limiter.getResetTime(identifier).toString(),
            'Retry-After': Math.ceil(limiter.getWindowMs() / 1000).toString(),
          }
        }
      );
    }

    const response = await handler(req);
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limiter.getMaxRequests().toString());
    response.headers.set('X-RateLimit-Remaining', limiter.getRemaining(identifier).toString());
    response.headers.set('X-RateLimit-Reset', limiter.getResetTime(identifier).toString());
    
    return response;
  };
}

export { chatLimiter, authLimiter, apiLimiter };
