import { NextRequest, NextResponse } from 'next/server';
import {
  withRateLimit,
  RateLimitConfigs,
  authRateLimit,
  apiRateLimit,
  generalRateLimit,
  sensitiveRateLimit,
  clearRateLimitStore,
} from '@/lib/middleware/rateLimit';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    logRequest: jest.fn(() => ({ requestId: 'test-id' })),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockHandler = jest.fn(() => {
  const response = NextResponse.json({ success: true });
  return Promise.resolve(response);
});

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear rate limit store before each test
    clearRateLimitStore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('withRateLimit', () => {
    it('allows requests within rate limit', async () => {
      const config = {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('blocks requests when rate limit is exceeded', async () => {
      const config = {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 2,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // Make requests up to the limit
      await wrappedHandler(request);
      await wrappedHandler(request);
      
      // This request should be blocked
      const blockedResponse = await wrappedHandler(request);
      const data = await blockedResponse.json();
      
      expect(blockedResponse.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Rate limit exceeded');
      expect(data.retryAfter).toBeGreaterThan(0);
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it('includes correct rate limit headers', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 5,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      const response = await wrappedHandler(request);
      
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4');
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('includes retry-after header when rate limited', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // First request should pass
      await wrappedHandler(request);
      
      // Second request should be blocked
      const blockedResponse = await wrappedHandler(request);
      
      expect(blockedResponse.status).toBe(429);
      expect(blockedResponse.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(blockedResponse.headers.get('Retry-After')).toBeTruthy();
    });

    it('uses custom key generator when provided', async () => {
      const customKeyGenerator = jest.fn(() => 'custom-key');
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 2,
        keyGenerator: customKeyGenerator,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      await wrappedHandler(request);
      
      expect(customKeyGenerator).toHaveBeenCalledWith(request);
    });

    it('uses default key generator with IP and pathname', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 5,
      };

      // Mock request with IP
      const request = new NextRequest('http://localhost:3000/api/test');
      Object.defineProperty(request, 'ip', {
        value: '192.168.1.1',
        writable: true,
      });

      const wrappedHandler = withRateLimit(mockHandler, config);

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
    });

    it('handles requests without IP gracefully', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 5,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
    });

    it('calls custom onLimitReached handler when provided', async () => {
      const customLimitReached = jest.fn(() => 
        NextResponse.json({ custom: 'rate limited' }, { status: 429 })
      );
      
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 1,
        onLimitReached: customLimitReached,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // First request passes
      await wrappedHandler(request);
      
      // Second request should trigger custom handler
      const blockedResponse = await wrappedHandler(request);
      const data = await blockedResponse.json();
      
      expect(blockedResponse.status).toBe(429);
      expect(data.custom).toBe('rate limited');
      expect(customLimitReached).toHaveBeenCalledWith(request);
    });

    it('uses custom message when provided', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 1,
        message: 'Custom rate limit message',
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      await wrappedHandler(request);
      
      const blockedResponse = await wrappedHandler(request);
      const data = await blockedResponse.json();
      
      expect(data.message).toBe('Custom rate limit message');
    });

    it('resets rate limit after time window expires', async () => {
      jest.useFakeTimers();
      
      const config = {
        windowMs: 1000, // 1 second
        maxRequests: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // First request should pass
      const response1 = await wrappedHandler(request);
      expect(response1.status).toBe(200);
      
      // Second request should be blocked
      const response2 = await wrappedHandler(request);
      expect(response2.status).toBe(429);
      
      // Fast forward past the window
      jest.advanceTimersByTime(2000);
      
      // Third request should pass after window reset
      const response3 = await wrappedHandler(request);
      expect(response3.status).toBe(200);
      
      jest.useRealTimers();
    });

    it('cleans up expired entries', async () => {
      jest.useFakeTimers();
      
      const config = {
        windowMs: 1000,
        maxRequests: 5,
      };

      const request1 = new NextRequest('http://localhost:3000/api/test1');
      const request2 = new NextRequest('http://localhost:3000/api/test2');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // Make requests to create entries
      await wrappedHandler(request1);
      await wrappedHandler(request2);
      
      // Fast forward to expire entries
      jest.advanceTimersByTime(2000);
      
      // New request should trigger cleanup
      await wrappedHandler(request1);
      
      // Verify cleanup worked by checking that old entries don't interfere
      expect(mockHandler).toHaveBeenCalledTimes(3);
      
      jest.useRealTimers();
    });

    it('logs rate limit exceeded events', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      await wrappedHandler(request);
      
      const blockedResponse = await wrappedHandler(request);
      expect(blockedResponse.status).toBe(429);
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Rate limit exceeded',
        undefined,
        expect.objectContaining({
          requestCount: 1, // The count when rate limit is hit
          maxRequests: 1,
        })
      );
    });

    it('continues with request on middleware error', async () => {
      // Force an error by mocking logger.logRequest to throw
      (logger.logRequest as jest.Mock).mockImplementation(() => {
        throw new Error('Logger error');
      });

      const config = {
        windowMs: 60 * 1000,
        maxRequests: 5,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      const response = await wrappedHandler(request);
      
      // Should continue with original handler despite error
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'Rate limit middleware error',
        expect.any(Error),
        expect.objectContaining({ requestId: 'test-id' })
      );
    });
  });

  describe('Rate Limit Configurations', () => {
    it('provides correct auth rate limit config', () => {
      expect(RateLimitConfigs.auth).toEqual({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        message: 'Too many authentication attempts. Please try again later.',
      });
    });

    it('provides correct API rate limit config', () => {
      expect(RateLimitConfigs.api).toEqual({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
        message: 'Too many API requests. Please slow down.',
      });
    });

    it('provides correct general rate limit config', () => {
      expect(RateLimitConfigs.general).toEqual({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        message: 'Too many requests. Please try again later.',
      });
    });

    it('provides correct sensitive rate limit config', () => {
      expect(RateLimitConfigs.sensitive).toEqual({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        message: 'Too many sensitive operations. Please wait before trying again.',
      });
    });
  });

  describe('Pre-configured Rate Limiters', () => {
    describe('authRateLimit', () => {
      it('applies auth rate limiting', async () => {
        const request = new NextRequest('http://localhost:3000/api/auth');
        const wrappedHandler = authRateLimit(mockHandler);

        // Make 5 requests (the limit)
        for (let i = 0; i < 5; i++) {
          const response = await wrappedHandler(request);
          expect(response.status).toBe(200);
        }

        // 6th request should be blocked
        const blockedResponse = await wrappedHandler(request);
        expect(blockedResponse.status).toBe(429);
      });
    });

    describe('apiRateLimit', () => {
      it('applies API rate limiting', async () => {
        const request = new NextRequest('http://localhost:3000/api/data');
        const wrappedHandler = apiRateLimit(mockHandler);

        // Should allow many requests within the 60/minute limit
        for (let i = 0; i < 10; i++) {
          const response = await wrappedHandler(request);
          expect(response.status).toBe(200);
        }
      });
    });

    describe('generalRateLimit', () => {
      it('applies general rate limiting', async () => {
        const request = new NextRequest('http://localhost:3000/api/general');
        const wrappedHandler = generalRateLimit(mockHandler);

        // Should allow many requests within the 100/minute limit
        for (let i = 0; i < 20; i++) {
          const response = await wrappedHandler(request);
          expect(response.status).toBe(200);
        }
      });
    });

    describe('sensitiveRateLimit', () => {
      it('applies sensitive operation rate limiting', async () => {
        const request = new NextRequest('http://localhost:3000/api/sensitive');
        const wrappedHandler = sensitiveRateLimit(mockHandler);

        // Make 3 requests (the limit)
        for (let i = 0; i < 3; i++) {
          const response = await wrappedHandler(request);
          expect(response.status).toBe(200);
        }

        // 4th request should be blocked
        const blockedResponse = await wrappedHandler(request);
        expect(blockedResponse.status).toBe(429);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles concurrent requests correctly', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 3,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // Make 5 concurrent requests
      const promises = Array(5).fill(null).map(() => wrappedHandler(request));
      const responses = await Promise.all(promises);

      // Count successful and blocked responses
      const successCount = responses.filter((r: any) => r.status === 200).length;
      const blockedCount = responses.filter((r: any) => r.status === 429).length;

      expect(successCount).toBe(3);
      expect(blockedCount).toBe(2);
    });

    it('handles different endpoints separately', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 2,
      };

      const request1 = new NextRequest('http://localhost:3000/api/test1');
      const request2 = new NextRequest('http://localhost:3000/api/test2');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // Each endpoint should have its own rate limit
      await wrappedHandler(request1);
      await wrappedHandler(request1);
      await wrappedHandler(request2);
      await wrappedHandler(request2);

      // Third request to each endpoint should be blocked
      const response1 = await wrappedHandler(request1);
      const response2 = await wrappedHandler(request2);

      expect(response1.status).toBe(429);
      expect(response2.status).toBe(429);
    });

    it('handles very short time windows', async () => {
      jest.useFakeTimers();

      const config = {
        windowMs: 100, // 100ms
        maxRequests: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // First request should pass
      const response1 = await wrappedHandler(request);
      expect(response1.status).toBe(200);

      // Second request immediately should be blocked
      const response2 = await wrappedHandler(request);
      expect(response2.status).toBe(429);

      // After time window, should work again
      jest.advanceTimersByTime(150);
      
      const response3 = await wrappedHandler(request);
      expect(response3.status).toBe(200);

      jest.useRealTimers();
    });

    it('handles very high rate limits', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 1000,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // Should handle high limits without issues
      for (let i = 0; i < 50; i++) {
        const response = await wrappedHandler(request);
        expect(response.status).toBe(200);
      }
    });

    it('preserves original request properties', async () => {
      const config = {
        windowMs: 60 * 1000,
        maxRequests: 5,
      };

      const originalUrl = 'http://localhost:3000/api/test?param=value';
      const request = new NextRequest(originalUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
      });

      const wrappedHandler = withRateLimit(mockHandler, config);

      await wrappedHandler(request);

      const calledRequest = (mockHandler.mock.calls as any)[0]?.[0];
      expect(calledRequest?.url).toBe(originalUrl);
      expect(calledRequest?.method).toBe('POST');
      expect(calledRequest?.headers.get('content-type')).toBe('application/json');
    });

    it('calculates retry-after correctly', async () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      const config = {
        windowMs: 60 * 1000, // 60 seconds
        maxRequests: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withRateLimit(mockHandler, config);

      // First request sets the window
      await wrappedHandler(request);

      // Move forward 10 seconds
      jest.advanceTimersByTime(10 * 1000);

      // Second request should be blocked with 50 seconds retry-after
      const blockedResponse = await wrappedHandler(request);
      const data = await blockedResponse.json();

      expect(data.retryAfter).toBe(50); // 60 - 10 = 50 seconds remaining

      jest.useRealTimers();
    });
  });
});