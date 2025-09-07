import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { 
  withValidation, 
  withBodyValidation, 
  withQueryValidation 
} from '@/lib/middleware/validation';
import { logger } from '@/lib/logger';
import { ValidationUtils } from '@/lib/validation';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    logRequest: jest.fn(() => ({ requestId: 'test-id' })),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/validation', () => ({
  ValidationUtils: {
    validateAndSanitize: jest.fn(),
  },
}));

const mockHandler = jest.fn(() => 
  Promise.resolve(NextResponse.json({ success: true }))
);

// Test schemas
const bodySchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(120),
  email: z.string().email(),
});

const querySchema = z.object({
  page: z.string().transform(s => parseInt(s)).refine(n => n > 0),
  limit: z.string().transform(s => parseInt(s)).optional(),
  search: z.string().optional(),
});

const headersSchema = z.object({
  'content-type': z.string(),
  authorization: z.string().optional(),
});

describe('Validation Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ValidationUtils.validateAndSanitize as jest.Mock).mockImplementation(
      (schema, data) => data
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('withValidation', () => {
    describe('Body Validation', () => {
      it('validates request body successfully', async () => {
        const requestBody = {
          name: 'John Doe',
          age: 30,
          email: 'john@example.com',
        };

        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
          sanitize: true,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          bodySchema,
          requestBody,
          { sanitize: true }
        );
      });

      it('skips body validation for GET requests', async () => {
        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'GET',
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
        expect(ValidationUtils.validateAndSanitize).not.toHaveBeenCalled();
      });

      it('returns 400 for invalid request body', async () => {
        const zodError = new ZodError([
          {
            path: ['name'],
            message: 'Required',
            code: z.ZodIssueCode.invalid_type,
            expected: 'string',
            received: 'undefined',
          },
        ]);

        (ValidationUtils.validateAndSanitize as jest.Mock).mockImplementation(() => {
          throw zodError;
        });

        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify({ age: 30 }),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
        });

        const response = await wrappedHandler(request);
        const data = await response.json();
        
        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid request body');
        expect(data.details).toEqual([
          {
            field: 'name',
            message: 'Required',
            code: 'invalid_type',
          },
        ]);
        expect(mockHandler).not.toHaveBeenCalled();
      });

      it('attaches validated body to request', async () => {
        const requestBody = { name: 'John', age: 30, email: 'john@example.com' };
        const sanitizedBody = { name: 'John Doe', age: 30, email: 'john@example.com' };

        (ValidationUtils.validateAndSanitize as jest.Mock).mockReturnValue(sanitizedBody);

        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
        });

        await wrappedHandler(request);
        
        expect(mockHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            validatedBody: sanitizedBody,
          })
        );
      });

      it('calls custom validation error handler', async () => {
        const zodError = new ZodError([
          {
            path: ['name'],
            message: 'Required',
            code: z.ZodIssueCode.invalid_type,
            expected: 'string',
            received: 'undefined',
          },
        ]);

        (ValidationUtils.validateAndSanitize as jest.Mock).mockImplementation(() => {
          throw zodError;
        });

        const customErrorHandler = jest.fn(() => 
          NextResponse.json({ custom: 'validation error' }, { status: 422 })
        );

        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify({}),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
          onValidationError: customErrorHandler,
        });

        const response = await wrappedHandler(request);
        const data = await response.json();
        
        expect(response.status).toBe(422);
        expect(data.custom).toBe('validation error');
        expect(customErrorHandler).toHaveBeenCalledWith(zodError);
      });

      it('handles JSON parsing errors', async () => {
        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: 'invalid json',
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(500);
        expect(mockHandler).not.toHaveBeenCalled();
      });
    });

    describe('Query Validation', () => {
      it('validates query parameters successfully', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/test?page=1&limit=10&search=test'
        );

        const wrappedHandler = withValidation(mockHandler, {
          query: querySchema,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          querySchema,
          {
            page: '1',
            limit: '10',
            search: 'test',
          },
          { sanitize: undefined }
        );
      });

      it('handles query parameters with JSON values', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/test?filters={"name":"test"}&page=1'
        );

        const complexQuerySchema = z.object({
          filters: z.object({
            name: z.string(),
          }),
          page: z.string().transform(s => parseInt(s)),
        });

        const wrappedHandler = withValidation(mockHandler, {
          query: complexQuerySchema,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          complexQuerySchema,
          {
            filters: { name: 'test' },
            page: '1',
          },
          { sanitize: undefined }
        );
      });

      it('returns 400 for invalid query parameters', async () => {
        const zodError = new ZodError([
          {
            path: ['page'],
            message: 'Expected number, received nan',
            code: z.ZodIssueCode.invalid_type,
            expected: 'number',
            received: 'nan',
          },
        ]);

        (ValidationUtils.validateAndSanitize as jest.Mock).mockImplementation(() => {
          throw zodError;
        });

        const request = new NextRequest('http://localhost:3000/api/test?page=invalid');

        const wrappedHandler = withValidation(mockHandler, {
          query: querySchema,
        });

        const response = await wrappedHandler(request);
        const data = await response.json();
        
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid query parameters');
        expect(data.details[0].field).toBe('page');
      });

      it('attaches validated query to request', async () => {
        const validatedQuery = { page: 1, limit: 10, search: 'test' };
        (ValidationUtils.validateAndSanitize as jest.Mock).mockReturnValue(validatedQuery);

        const request = new NextRequest(
          'http://localhost:3000/api/test?page=1&limit=10&search=test'
        );

        const wrappedHandler = withValidation(mockHandler, {
          query: querySchema,
        });

        await wrappedHandler(request);
        
        expect(mockHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            validatedQuery,
          })
        );
      });

      it('handles empty query parameters', async () => {
        const request = new NextRequest('http://localhost:3000/api/test');

        const wrappedHandler = withValidation(mockHandler, {
          query: z.object({
            optional: z.string().optional(),
          }),
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          expect.any(Object),
          {},
          { sanitize: undefined }
        );
      });
    });

    describe('Header Validation', () => {
      it('validates headers successfully', async () => {
        const request = new NextRequest('http://localhost:3000/api/test', {
          headers: {
            'content-type': 'application/json',
            authorization: 'Bearer token',
          },
        });

        const wrappedHandler = withValidation(mockHandler, {
          headers: headersSchema,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          headersSchema,
          {
            'content-type': 'application/json',
            authorization: 'Bearer token',
          },
          { sanitize: undefined }
        );
      });

      it('returns 400 for invalid headers', async () => {
        const zodError = new ZodError([
          {
            path: ['content-type'],
            message: 'Required',
            code: z.ZodIssueCode.invalid_type,
            expected: 'string',
            received: 'undefined',
          },
        ]);

        (ValidationUtils.validateAndSanitize as jest.Mock).mockImplementation(() => {
          throw zodError;
        });

        const request = new NextRequest('http://localhost:3000/api/test');

        const wrappedHandler = withValidation(mockHandler, {
          headers: headersSchema,
        });

        const response = await wrappedHandler(request);
        const data = await response.json();
        
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request headers');
        expect(data.details[0].field).toBe('content-type');
      });

      it('attaches validated headers to request', async () => {
        const validatedHeaders = { 'content-type': 'application/json' };
        (ValidationUtils.validateAndSanitize as jest.Mock).mockReturnValue(validatedHeaders);

        const request = new NextRequest('http://localhost:3000/api/test', {
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          headers: headersSchema,
        });

        await wrappedHandler(request);
        
        expect(mockHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            validatedHeaders,
          })
        );
      });
    });

    describe('Multiple Validations', () => {
      it('validates body, query, and headers together', async () => {
        const requestBody = { name: 'John', age: 30, email: 'john@example.com' };
        
        const request = new NextRequest(
          'http://localhost:3000/api/test?page=1&limit=5',
          {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
              'content-type': 'application/json',
              authorization: 'Bearer token',
            },
          }
        );

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
          query: querySchema,
          headers: headersSchema,
          sanitize: true,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledTimes(3);
      });

      it('stops at first validation error', async () => {
        const zodError = new ZodError([
          {
            path: ['name'],
            message: 'Required',
            code: z.ZodIssueCode.invalid_type,
            expected: 'string',
            received: 'undefined',
          },
        ]);

        (ValidationUtils.validateAndSanitize as jest.Mock)
          .mockImplementationOnce(() => { throw zodError; })
          .mockReturnValue({ page: 1 });

        const request = new NextRequest(
          'http://localhost:3000/api/test?page=1',
          {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'content-type': 'application/json' },
          }
        );

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
          query: querySchema,
          headers: headersSchema,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(400);
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledTimes(1);
      });
    });

    describe('Error Handling', () => {
      it('logs validation errors', async () => {
        const zodError = new ZodError([
          {
            path: ['name'],
            message: 'Required',
            code: z.ZodIssueCode.invalid_type,
            expected: 'string',
            received: 'undefined',
          },
        ]);

        (ValidationUtils.validateAndSanitize as jest.Mock).mockImplementation(() => {
          throw zodError;
        });

        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify({}),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
        });

        await wrappedHandler(request);
        
        expect(logger.warn).toHaveBeenCalledWith(
          'Request body validation failed',
          zodError,
          { requestId: 'test-id' }
        );
      });

      it('handles non-Zod validation errors', async () => {
        (ValidationUtils.validateAndSanitize as jest.Mock).mockImplementation(() => {
          throw new Error('Unexpected error');
        });

        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
        });

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(500);
        expect(logger.error).toHaveBeenCalled();
      });

      it('handles middleware errors gracefully', async () => {
        (ValidationUtils.validateAndSanitize as jest.Mock).mockImplementation(() => {
          throw new Error('Critical error');
        });

        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify({}),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withValidation(mockHandler, {
          body: bodySchema,
        });

        const response = await wrappedHandler(request);
        const data = await response.json();
        
        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Internal server error');
      });
    });

    it('logs requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const wrappedHandler = withValidation(mockHandler, {});

      await wrappedHandler(request);
      
      expect(logger.logRequest).toHaveBeenCalledWith(request);
    });
  });

  describe('Helper Functions', () => {
    describe('withBodyValidation', () => {
      it('creates a middleware for body validation only', async () => {
        const requestBody = { name: 'John', age: 30, email: 'john@example.com' };
        
        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withBodyValidation(bodySchema, false)(mockHandler);

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            validatedBody: requestBody,
          })
        );
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          bodySchema,
          requestBody,
          { sanitize: false }
        );
      });

      it('uses sanitize=true by default', async () => {
        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify({ name: 'John', age: 30, email: 'john@example.com' }),
          headers: { 'content-type': 'application/json' },
        });

        const wrappedHandler = withBodyValidation(bodySchema)(mockHandler);

        await wrappedHandler(request);
        
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          bodySchema,
          expect.any(Object),
          { sanitize: true }
        );
      });
    });

    describe('withQueryValidation', () => {
      it('creates a middleware for query validation only', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/test?page=1&limit=10'
        );

        const wrappedHandler = withQueryValidation(querySchema, false)(mockHandler);

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            validatedQuery: { page: '1', limit: '10' },
          })
        );
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          querySchema,
          { page: '1', limit: '10' },
          { sanitize: false }
        );
      });

      it('uses sanitize=true by default', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/test?page=1'
        );

        const wrappedHandler = withQueryValidation(querySchema)(mockHandler);

        await wrappedHandler(request);
        
        expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
          querySchema,
          expect.any(Object),
          { sanitize: true }
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles requests without body', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      });

      const wrappedHandler = withValidation(mockHandler, {
        body: bodySchema,
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(500); // JSON parsing will fail
    });

    it('handles malformed JSON in query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test?filters=invalid-json'
      );

      const complexQuerySchema = z.object({
        filters: z.object({
          name: z.string(),
        }),
      });

      const wrappedHandler = withValidation(mockHandler, {
        query: complexQuerySchema,
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200); // Should fallback to string value
      expect(ValidationUtils.validateAndSanitize).toHaveBeenCalledWith(
        complexQuerySchema,
        { filters: 'invalid-json' },
        { sanitize: undefined }
      );
    });

    it('preserves original request properties', async () => {
      const originalUrl = 'http://localhost:3000/api/test?original=param';
      const request = new NextRequest(originalUrl, {
        method: 'POST',
        body: JSON.stringify({ name: 'test', age: 25, email: 'test@example.com' }),
        headers: { 'content-type': 'application/json', 'x-custom': 'header' },
      });

      const wrappedHandler = withValidation(mockHandler, {
        body: bodySchema,
      });

      await wrappedHandler(request);
      
      const calledRequest = (mockHandler.mock.calls as any)[0]?.[0];
      expect(calledRequest?.url).toBe(originalUrl);
      expect(calledRequest?.method).toBe('POST');
      expect(calledRequest?.headers.get('x-custom')).toBe('header');
    });

    it('handles empty headers object', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const wrappedHandler = withValidation(mockHandler, {
        headers: z.object({
          optional: z.string().optional(),
        }),
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
    });
  });
});