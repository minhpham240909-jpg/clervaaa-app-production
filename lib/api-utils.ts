import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { monitoring } from './monitoring';
import { ValidationUtils } from './validation';
import { z } from 'zod';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function createAPIResponse<T>(
  data?: T,
  message?: string
): APIResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  error: string,
  _statusCode: number = 500,
  _code?: string
): APIResponse {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };
}

export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const context = logger.logRequest(req);

    try {
      const response = await handler(req);
      const responseTime = Date.now() - startTime;
      
      monitoring.recordAPIPerformance(
        req.nextUrl.pathname,
        req.method,
        responseTime,
        response.status
      );
      
      logger.logResponse(context, response.status, responseTime);
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof APIError) {
        monitoring.recordAPIPerformance(
          req.nextUrl.pathname,
          req.method,
          responseTime,
          error.statusCode
        );
        
        logger.error(`API Error: ${error.message}`, error, context);
        
        return NextResponse.json(
          createErrorResponse(error.message, error.statusCode, error.code),
          { status: error.statusCode }
        );
      }

      if (error instanceof z.ZodError) {
        monitoring.recordAPIPerformance(
          req.nextUrl.pathname,
          req.method,
          responseTime,
          400
        );
        
        logger.error('Validation error:', error, context);
        
        return NextResponse.json(
          createErrorResponse(
            'Validation failed',
            400,
            'VALIDATION_ERROR'
          ),
          { status: 400 }
        );
      }

      // Generic error handling
      monitoring.recordAPIPerformance(
        req.nextUrl.pathname,
        req.method,
        responseTime,
        500
      );
      
      logger.error('Unexpected error:', error as Error, context);
      
      return NextResponse.json(
        createErrorResponse(
          'Internal server error',
          500,
          'INTERNAL_ERROR'
        ),
        { status: 500 }
      );
    }
  };
}

export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (_req: NextRequest, _data: T) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest) => {
    let data: T;

    if (req.method === 'GET') {
      // Parse query parameters
      const url = new URL(req.url);
      const queryData = Object.fromEntries(url.searchParams.entries());
      data = ValidationUtils.validateAndSanitize(schema, queryData, { sanitize: true });
    } else {
      // Parse JSON body
      const body = await req.json().catch(() => ({}));
      data = ValidationUtils.validateAndSanitize(schema, body, { sanitize: true });
    }

    return handler(req, data);
  });
}

export function requireAuth(
  handler: (_req: NextRequest, _user: { id: string; email: string; name?: string | null }) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest) => {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('./auth');
    const { prisma } = await import('./prisma');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new APIError(401, 'Authentication required', 'AUTH_REQUIRED');
    }

    // Fetch user data to ensure they exist and are active
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        profileComplete: true,
        allowPartnerRequests: true,
        profileVisibility: true,
      },
    });

    if (!user) {
      throw new APIError(404, 'User not found', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new APIError(403, 'Account inactive', 'ACCOUNT_INACTIVE');
    }

    return handler(req, user);
  });
}

export function requireCompleteProfile(
  handler: (_req: NextRequest, _user: { id: string; email: string; name?: string | null }) => Promise<NextResponse>
) {
  return requireAuth(async (req: NextRequest, user: { id: string; email: string; name?: string | null; isActive?: boolean; profileComplete?: boolean }) => {
    if (!user.profileComplete) {
      throw new APIError(
        428, 
        'Profile incomplete. Please complete your profile first.',
        'PROFILE_INCOMPLETE'
      );
    }
    return handler(req, user);
  });
}

export function withRateLimit(
  limiter: any,
  handler: (_req: NextRequest) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest) => {
    const identifier = req.ip || 'unknown';
    
    if (!limiter.isAllowed(identifier)) {
      throw new APIError(
        429,
        limiter.getMessage(),
        'RATE_LIMIT_EXCEEDED'
      );
    }

    return handler(req);
  });
}

// Utility functions for common API patterns
export function paginateResults<T>(
  results: T[],
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;
  const paginatedResults = results.slice(offset, offset + limit);
  const total = results.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data: paginatedResults,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .substring(0, 100);
}

export function validatePagination(params: {
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  
  return { page, limit };
}

// Enhanced caching utilities
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCachedData<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
  
  // Clean up old entries periodically
  if (cache.size > 1000) {
    const now = Date.now();
    const entries = Array.from(cache.entries());
    for (const [k, v] of entries) {
      if (now - v.timestamp > v.ttl) {
        cache.delete(k);
      }
    }
  }
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  const regex = new RegExp(pattern);
  const keys = Array.from(cache.keys());
  for (const key of keys) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

// Database query optimization helpers
export const commonUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  studyLevel: true,
  totalPoints: true,
  currentStreak: true,
  profileComplete: true,
  isActive: true,
} as const;

export const commonSubjectSelect = {
  id: true,
  name: true,
  category: true,
  description: true,
  isActive: true,
} as const;

// Enhanced pagination with database optimization
export function createDatabasePagination(
  page: number = 1,
  limit: number = 20,
  maxLimit: number = 100
) {
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(maxLimit, Math.max(1, limit));
  const skip = (validatedPage - 1) * validatedLimit;
  
  return {
    page: validatedPage,
    limit: validatedLimit,
    skip,
    take: validatedLimit,
  };
}

export function createPaginationResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      hasMore: page * limit < total,
    },
  };
}

// Performance monitoring wrapper
export function withPerformanceMonitoring<T extends any[]>(
  operation: string,
  handler: (...args: T) => Promise<any>
) {
  return async (...args: T) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await handler(...args);
      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();
      
      logger.info(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        memoryDelta: `${(endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024}MB`,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Performance error: ${operation}`, error as Error, {
        duration: `${duration}ms`,
      });
      throw error;
    }
  };
}

// Input sanitization and validation helpers
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, '') // Remove potential HTML/XSS chars
    .replace(/\s+/g, ' '); // Normalize whitespace
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    throw new APIError(400, `${fieldName} is required`, 'MISSING_REQUIRED_FIELD');
  }
  return value;
}

// Response helpers with consistent formatting
export function successResponse<T>(
  data: T,
  message?: string,
  metadata?: Record<string, any>
): NextResponse {
  const response = createAPIResponse(data, message);
  if (metadata) {
    (response as any).metadata = metadata;
  }
  return NextResponse.json(response);
}

export function errorResponseWithCode(
  message: string,
  statusCode: number,
  code: string,
  details?: any
): NextResponse {
  const response = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
  
  return NextResponse.json(response, { status: statusCode });
}

// Health check utilities
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; responseTime: number; error?: string }> {
  const startTime = Date.now();
  try {
    const { prisma } = await import('./prisma');
    await prisma.$queryRaw`SELECT 1`;
    return { 
      healthy: true, 
      responseTime: Date.now() - startTime 
    };
  } catch (error) {
    return { 
      healthy: false, 
      responseTime: Date.now() - startTime,
      error: (error as Error).message 
    };
  }
}

export async function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  const [dbHealth] = await Promise.all([
    checkDatabaseHealth(),
  ]);
  
  return {
    uptime: process.uptime(),
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    },
    database: dbHealth,
    cache: {
      size: cache.size,
    },
    timestamp: new Date().toISOString(),
  };
}
