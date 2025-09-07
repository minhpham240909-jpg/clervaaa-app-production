import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '@/lib/logger';
import { ValidationUtils } from '@/lib/validation';

export interface ValidationMiddlewareOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
  sanitize?: boolean;
  onValidationError?: (_error: ZodError) => NextResponse;
}

/**
 * Middleware for request validation using Zod schemas
 */
export function withValidation(
  handler: (
    _req: NextRequest & {
      validatedBody?: any;
      validatedQuery?: any;
      validatedHeaders?: any;
    }
  ) => Promise<NextResponse>,
  options: ValidationMiddlewareOptions
) {
  return async (req: NextRequest) => {
    const context = logger.logRequest(req);
    
    try {
      // Validate request body
      if (options.body && req.method !== 'GET') {
        try {
          const body = await req.json();
          const validatedBody = ValidationUtils.validateAndSanitize(
            options.body,
            body,
            { sanitize: options.sanitize }
          );
          (req as any).validatedBody = validatedBody;
        } catch (error) {
          if (error instanceof ZodError) {
            logger.warn('Request body validation failed', context, error);
            if (options.onValidationError) {
              return options.onValidationError(error);
            }
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid request body',
                details: error.errors.map((e: any) => ({
                  field: e.path.join('.'),
                  message: e.message,
                  code: e.code
                }))
              },
              { status: 400 }
            );
          }
          throw error;
        }
      }

      // Validate query parameters
      if (options.query) {
        try {
          const url = new URL(req.url);
          const queryParams: Record<string, any> = {};
          
          // Convert URLSearchParams to regular object
          url.searchParams.forEach((value, key) => {
            // Try to parse as JSON for complex values, fallback to string
            try {
              queryParams[key] = JSON.parse(value);
            } catch {
              queryParams[key] = value;
            }
          });

          const validatedQuery = ValidationUtils.validateAndSanitize(
            options.query,
            queryParams,
            { sanitize: options.sanitize }
          );
          (req as any).validatedQuery = validatedQuery;
        } catch (error) {
          if (error instanceof ZodError) {
            logger.warn('Request query validation failed', context, error);
            if (options.onValidationError) {
              return options.onValidationError(error);
            }
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid query parameters',
                details: error.errors.map((e: any) => ({
                  field: e.path.join('.'),
                  message: e.message,
                  code: e.code
                }))
              },
              { status: 400 }
            );
          }
          throw error;
        }
      }

      // Validate headers
      if (options.headers) {
        try {
          const headers: Record<string, string> = {};
          req.headers.forEach((value, key) => {
            headers[key] = value;
          });

          const validatedHeaders = ValidationUtils.validateAndSanitize(
            options.headers,
            headers,
            { sanitize: options.sanitize }
          );
          (req as any).validatedHeaders = validatedHeaders;
        } catch (error) {
          if (error instanceof ZodError) {
            logger.warn('Request headers validation failed', context, error);
            if (options.onValidationError) {
              return options.onValidationError(error);
            }
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid request headers',
                details: error.errors.map((e: any) => ({
                  field: e.path.join('.'),
                  message: e.message,
                  code: e.code
                }))
              },
              { status: 400 }
            );
          }
          throw error;
        }
      }

      return await handler(req);
    } catch (error) {
      logger.error('Validation middleware error', error instanceof Error ? error : new Error(String(error)), context);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Simple body validation middleware for use with MiddlewareComposer
 */
export function withBodyValidation(schema: ZodSchema, sanitize = true) {
  return (handler: (_req: NextRequest & { validatedBody?: any }) => Promise<NextResponse>) => {
    return withValidation(handler, {
      body: schema,
      sanitize,
    });
  };
}

/**
 * Simple query validation middleware for use with MiddlewareComposer
 */
export function withQueryValidation(schema: ZodSchema, sanitize = true) {
  return (handler: (_req: NextRequest & { validatedQuery?: any }) => Promise<NextResponse>) => {
    return withValidation(handler, {
      query: schema,
      sanitize,
    });
  };
}

/**
 * Legacy body validation middleware (for backward compatibility)
 */
export function withBodyValidationLegacy<T>(
  handler: (_req: NextRequest & { validatedBody?: T }) => Promise<NextResponse>,
  schema: ZodSchema<T>,
  sanitize = true
) {
  return withValidation(handler, {
    body: schema,
    sanitize,
  });
}

/**
 * Legacy query validation middleware (for backward compatibility)
 */
export function withQueryValidationLegacy<T>(
  handler: (_req: NextRequest & { validatedQuery?: T }) => Promise<NextResponse>,
  schema: ZodSchema<T>,
  sanitize = true
) {
  return withValidation(handler, {
    query: schema,
    sanitize,
  });
}