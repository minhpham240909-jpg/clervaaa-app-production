import { logger, LogLevel } from '@/lib/logger';

// Mock console methods
const consoleMocks = {
  debug: jest.spyOn(console, 'debug').mockImplementation(),
  info: jest.spyOn(console, 'info').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

// Store original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Restore original console methods and create fresh spies
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    
    // Update the mocks to use the new spies
    consoleMocks.debug = console.debug as jest.Mock;
    consoleMocks.info = console.info as jest.Mock;
    consoleMocks.warn = console.warn as jest.Mock;
    consoleMocks.error = console.error as jest.Mock;
    
    // Keep NODE_ENV as test for proper test logging
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true
    });
    // Enable test logging for logger tests
    logger.enableTestLogging();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Restore original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      writable: true
    });
    // Disable test logging after each test
    logger.disableTestLogging();
  });

  describe('Basic Logging', () => {
    it('logs debug messages in development', () => {
      logger.debug('Debug message', { userId: '123' });

      expect(consoleMocks.debug).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG | Debug message')
      );
    });

    it('logs info messages in development', () => {
      logger.info('Info message', { userId: '123' });

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO  | Info message')
      );
    });

    it('logs warn messages in all environments', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true
      });
      logger.warn('Warning message', { userId: '123' });

      expect(consoleMocks.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN  | Warning message')
      );
    });

    it('logs error messages in all environments', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true
      });
      logger.error('Error message', new Error('Test error'));

      expect(consoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR | Error message')
      );
    });
  });

  describe('Environment-based Filtering', () => {
    it('does not log debug/info in production by default', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true
      });

      logger.debug('Debug message');
      logger.info('Info message');

      expect(consoleMocks.debug).not.toHaveBeenCalled();
      expect(consoleMocks.info).not.toHaveBeenCalled();
    });

    it('does not log anything in test environment', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        writable: true
      });
      // Explicitly disable test logging for this test
      logger.disableTestLogging();

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(consoleMocks.debug).not.toHaveBeenCalled();
      expect(consoleMocks.info).not.toHaveBeenCalled();
      expect(consoleMocks.warn).not.toHaveBeenCalled();
      expect(consoleMocks.error).not.toHaveBeenCalled();
    });

    it('logs warn and error in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true
      });

      logger.warn('Warning message');
      logger.error('Error message');

      expect(consoleMocks.warn).toHaveBeenCalled();
      expect(consoleMocks.error).toHaveBeenCalled();
    });
  });

  describe('Log Formatting', () => {
    it('formats log entries with timestamp and level', () => {
      logger.info('Test message');

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO  \| Test message$/)
      );
    });

    it('includes context information in formatted logs', () => {
      const context = { userId: '123', endpoint: '/api/test' };
      logger.info('Test message', context);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('{"userId":"123","endpoint":"/api/test"}')
      );
    });

    it('includes error information in formatted logs', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(consoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('Error: Test error')
      );
    });

    it('includes additional data in formatted logs', () => {
      const data = { count: 5, items: ['a', 'b'] };
      logger.info('Operation completed', undefined, data);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Data: {"count":5,"items":["a","b"]}')
      );
    });
  });

  describe('Request Logging', () => {
    it('logs incoming requests with basic information', () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/test?param=value',
        method: 'POST',
        headers: new Map([
          ['user-agent', 'Mozilla/5.0'],
          ['x-forwarded-for', '192.168.1.1'],
        ]),
      };

      // Mock Request headers.get method
      mockRequest.headers.get = jest.fn((name: string) => {
        const headers: Record<string, string> = {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.1',
        };
        return headers[name] || undefined;
      });

      const context = logger.logRequest(mockRequest as any);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Incoming POST request to /api/test')
      );

      expect(context).toEqual({
        endpoint: '/api/test',
        method: 'POST',
        userAgent: 'Mozilla/5.0',
        ip: '192.168.1.1',
      });
    });

    it('handles requests without user-agent or IP', () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/test',
        method: 'GET',
        headers: new Map(),
      };

      mockRequest.headers.get = jest.fn(() => undefined);

      const context = logger.logRequest(mockRequest as any);

      expect(context.userAgent).toBeUndefined();
      expect(context.ip).toBeUndefined();
    });

    it('prefers x-real-ip over x-forwarded-for', () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/test',
        method: 'GET',
        headers: new Map(),
      };

      mockRequest.headers.get = jest.fn((name: string) => {
        if (name === 'x-forwarded-for') return '192.168.1.1';
        if (name === 'x-real-ip') return '10.0.0.1';
        return undefined;
      });

      const context = logger.logRequest(mockRequest as any);

      expect(context.ip).toBe('10.0.0.1');
    });
  });

  describe('Response Logging', () => {
    it('logs response information', () => {
      const context = { endpoint: '/api/test', method: 'POST' };
      logger.logResponse(context, 200, 150);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Response sent with status 200 in 150ms'),
        expect.objectContaining({
          ...context,
          statusCode: 200,
          responseTime: 150,
        })
      );
    });
  });

  describe('Database Logging', () => {
    it('logs database queries with duration', () => {
      const query = 'SELECT * FROM users WHERE id = ?';
      const params = ['123'];
      logger.logDatabaseQuery(query, params, 50);

      expect(consoleMocks.debug).toHaveBeenCalledWith(
        expect.stringContaining('Database query executed in 50ms')
      );
    });

    it('warns about slow database queries', () => {
      const query = 'SELECT * FROM users JOIN posts';
      const params: any[] = [];
      logger.logDatabaseQuery(query, params, 2000);

      expect(consoleMocks.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow database query (2000ms)')
      );
    });

    it('logs database errors', () => {
      const error = new Error('Connection timeout');
      const query = 'SELECT * FROM users';
      logger.logDatabaseError(error, query, ['123']);

      expect(consoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('Database error occurred')
      );
    });
  });

  describe('Authentication Logging', () => {
    it('logs successful login attempts', () => {
      logger.logLogin('user-123', 'google', true);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('User successfully logged in via google')
      );
    });

    it('logs failed login attempts as warnings', () => {
      logger.logLogin('user-123', 'email', false);

      expect(consoleMocks.warn).toHaveBeenCalledWith(
        expect.stringContaining('User failed to log in via email')
      );
    });

    it('logs logout events', () => {
      logger.logLogout('user-123');

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('User logged out')
      );
    });
  });

  describe('Security Logging', () => {
    it('logs security events with appropriate log level', () => {
      logger.logSecurityEvent('brute_force_attempt', 'critical', {
        ip: '192.168.1.1',
        attempts: 10,
      });

      expect(consoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('Security event: brute_force_attempt')
      );
    });

    it('logs medium/high security events as warnings', () => {
      logger.logSecurityEvent('suspicious_activity', 'high', {
        userId: 'user-123',
      });

      expect(consoleMocks.warn).toHaveBeenCalledWith(
        expect.stringContaining('Security event: suspicious_activity')
      );
    });

    it('logs low security events as info', () => {
      logger.logSecurityEvent('password_changed', 'low', {
        userId: 'user-123',
      });

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Security event: password_changed')
      );
    });
  });

  describe('Performance Logging', () => {
    it('logs normal performance metrics as debug', () => {
      logger.logPerformance('api_call', 100);

      expect(consoleMocks.debug).toHaveBeenCalledWith(
        expect.stringContaining('Operation completed: api_call in 100ms')
      );
    });

    it('warns about slow operations', () => {
      logger.logPerformance('slow_operation', 6000);

      expect(consoleMocks.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation detected: slow_operation took 6000ms')
      );
    });
  });

  describe('API Logging', () => {
    it('logs API requests', () => {
      logger.logAPIRequest('/api/users', 'GET', 'user-123');

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('API request: GET /api/users')
      );
    });

    it('logs successful API responses', () => {
      logger.logAPIResponse('/api/users', 'GET', 200, 150, 'user-123');

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('API response: GET /api/users - 200 (150ms)')
      );
    });

    it('logs error API responses as warnings', () => {
      logger.logAPIResponse('/api/users', 'POST', 400, 50, 'user-123');

      expect(consoleMocks.warn).toHaveBeenCalledWith(
        expect.stringContaining('API response: POST /api/users - 400 (50ms)')
      );
    });
  });

  describe('Business Logic Logging', () => {
    it('logs study session events', () => {
      logger.logStudySession('user-123', 'session-456', 'created');

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Study session created: session-456')
      );
    });

    it('logs partner matches', () => {
      logger.logPartnerMatch('user-123', 'user-456', 85);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Partner match found: user-123 ↔ user-456 (85% compatibility)')
      );
    });

    it('logs goal progress updates', () => {
      logger.logGoalProgress('user-123', 'goal-456', 75);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringContaining('Goal progress updated: goal-456 - 75% complete')
      );
    });
  });

  describe('Error Logging with Stack Trace', () => {
    it('logs errors with stack trace information', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      
      logger.logErrorWithStack('Operation failed', error);

      expect(consoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('Operation failed'),
      );
    });
  });

  describe('Utility Methods', () => {
    it('creates context with timestamp', () => {
      const context = logger.createContext({ userId: '123' });

      expect(context.timestamp).toBeDefined();
      expect(context.user1Id).toBe('123');
      expect(typeof context.timestamp).toBe('string');
    });

    it('adds values to existing context', () => {
      const baseContext = { userId: '123' };
      const newContext = logger.addToContext(baseContext, 'endpoint', '/api/test');

      expect(newContext.user1Id).toBe('123');
      expect(newContext.endpoint).toBe('/api/test');
      expect(newContext).not.toBe(baseContext); // Should be a new object
    });
  });

  describe('External Service Integration', () => {
    beforeEach(() => {
      // Mock process.env.SENTRY_DSN for external service tests
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
    });

    afterEach(() => {
      delete process.env.SENTRY_DSN;
    });

    it('calls external service for errors in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true
      });
      
      // Mock the sendToExternalService method
      const sendToExternalServiceSpy = jest.spyOn(logger as any, 'sendToExternalService');
      sendToExternalServiceSpy.mockImplementation(() => {});

      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(sendToExternalServiceSpy).toHaveBeenCalled();
      
      sendToExternalServiceSpy.mockRestore();
    });

    it('does not call external service in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true
      });
      
      const sendToExternalServiceSpy = jest.spyOn(logger as any, 'sendToExternalService');
      sendToExternalServiceSpy.mockImplementation(() => {});

      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(sendToExternalServiceSpy).not.toHaveBeenCalled();
      
      sendToExternalServiceSpy.mockRestore();
    });
  });

  describe('LogLevel Enum', () => {
    it('exports LogLevel enum correctly', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
      // FATAL level removed from LogLevel enum
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined context gracefully', () => {
      logger.info('Test message', undefined);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        expect.stringMatching(/INFO  \| Test message$/)
      );
    });

    it('handles undefined error gracefully', () => {
      logger.error('Error message', undefined);

      expect(consoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
    });

    it('handles circular references in context', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      // Should not throw an error
      expect(() => {
        logger.info('Test message', circular);
      }).not.toThrow();
    });

    it('handles non-Error objects passed as errors', () => {
      const notAnError = { message: 'Not an error object' };
      
      expect(() => {
        logger.error('Error occurred', notAnError as Error);
      }).not.toThrow();
    });

    it('handles very large data objects', () => {
      const largeData = {
        items: Array(1000).fill(0).map((_, i) => ({ id: i, name: `Item ${i}` }))
      };

      expect(() => {
        logger.info('Large data operation', undefined, largeData);
      }).not.toThrow();
    });
  });
});