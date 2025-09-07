import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withAuth, requireAuth, requireRoles, requirePermissions } from '@/lib/middleware/auth';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    logRequest: jest.fn(() => ({ requestId: 'test-id' })),
    logAPIRequest: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    permissions: ['read:profile', 'write:profile'],
  },
};

const mockHandler = jest.fn(() => 
  Promise.resolve(NextResponse.json({ success: true }))
);

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('withAuth', () => {
    it('allows requests when authentication is not required', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: false });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('allows requests when user is authenticated and auth is required', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: true });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('blocks requests when authentication is required but user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: true });

      const response = await wrappedHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
      expect(data.success).toBe(false);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('attaches session and user to request object', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: true });

      await wrappedHandler(request);
      
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          session: mockSession,
          user: mockSession.user,
        })
      );
    });

    it('calls custom onUnauthorized handler when provided', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const customUnauthorized = jest.fn(() => 
        NextResponse.json({ custom: 'unauthorized' }, { status: 401 })
      );
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        onUnauthorized: customUnauthorized,
      });

      const response = await wrappedHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.custom).toBe('unauthorized');
      expect(customUnauthorized).toHaveBeenCalled();
    });

    it('logs request information', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: true });

      await wrappedHandler(request);
      
      expect(logger.logRequest).toHaveBeenCalledWith(request);
      expect(logger.logAPIRequest).toHaveBeenCalledWith(
        '/api/test',
        'GET',
        'user-123',
        { requestId: 'test-id' }
      );
    });

    it('logs unauthorized access attempts', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: true });

      await wrappedHandler(request);
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Unauthorized access attempt',
        undefined,
        { requestId: 'test-id' }
      );
    });

    it('handles authentication errors gracefully', async () => {
      (getServerSession as jest.Mock).mockRejectedValue(new Error('Auth error'));
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: true });

      const response = await wrappedHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Role-based Authorization', () => {
    it('allows access when user has required role', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: ['USER', 'ADMIN'],
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('blocks access when user does not have required role', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: ['ADMIN'],
      });

      const response = await wrappedHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
      expect(data.success).toBe(false);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('logs access denied for insufficient role', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: ['ADMIN'],
      });

      await wrappedHandler(request);
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Access denied - insufficient role',
        undefined,
        expect.objectContaining({
          userRole: 'USER',
          requiredRoles: ['ADMIN'],
        })
      );
    });

    it('calls custom onForbidden handler for role violations', async () => {
      const customForbidden = jest.fn(() => 
        NextResponse.json({ custom: 'forbidden' }, { status: 403 })
      );
      
      const request = new NextRequest('http://localhost:3000/api/admin');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: ['ADMIN'],
        onForbidden: customForbidden,
      });

      const response = await wrappedHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.custom).toBe('forbidden');
      expect(customForbidden).toHaveBeenCalled();
    });
  });

  describe('Permission-based Authorization', () => {
    it('allows access when user has any of the required permissions', async () => {
      const request = new NextRequest('http://localhost:3000/api/profile');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        permissions: ['read:profile', 'admin:all'],
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('blocks access when user does not have required permissions', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin-only');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        permissions: ['admin:delete', 'admin:create'],
      });

      const response = await wrappedHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
      expect(data.success).toBe(false);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('handles users without permissions array', async () => {
      const sessionWithoutPermissions = {
        ...mockSession,
        user: {
          ...mockSession.user,
          permissions: undefined,
        },
      };
      
      (getServerSession as jest.Mock).mockResolvedValue(sessionWithoutPermissions);
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        permissions: ['read:profile'],
      });

      const response = await wrappedHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('logs access denied for insufficient permissions', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin-only');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        permissions: ['admin:delete'],
      });

      await wrappedHandler(request);
      
      expect(logger.warn).toHaveBeenCalledWith(
        'Access denied - insufficient permissions',
        undefined,
        expect.objectContaining({
          userPermissions: ['read:profile', 'write:profile'],
          requiredPermissions: ['admin:delete'],
        })
      );
    });

    it('calls custom onForbidden handler for permission violations', async () => {
      const customForbidden = jest.fn(() => 
        NextResponse.json({ custom: 'no-permissions' }, { status: 403 })
      );
      
      const request = new NextRequest('http://localhost:3000/api/admin-only');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        permissions: ['admin:delete'],
        onForbidden: customForbidden,
      });

      const response = await wrappedHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.custom).toBe('no-permissions');
      expect(customForbidden).toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    describe('requireAuth', () => {
      it('creates a middleware that requires authentication', async () => {
        const request = new NextRequest('http://localhost:3000/api/test');
        const wrappedHandler = requireAuth(mockHandler);

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
      });

      it('blocks unauthenticated requests', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);
        
        const request = new NextRequest('http://localhost:3000/api/test');
        const wrappedHandler = requireAuth(mockHandler);

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(401);
        expect(mockHandler).not.toHaveBeenCalled();
      });
    });

    describe('requireRole', () => {
      it('creates a middleware that requires specific roles', async () => {
        const request = new NextRequest('http://localhost:3000/api/test');
        const wrappedHandler = requireRoles(mockHandler, 'USER');

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
      });

      it('accepts multiple roles', async () => {
        const request = new NextRequest('http://localhost:3000/api/test');
        const wrappedHandler = requireRoles(mockHandler, 'ADMIN', 'USER');

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
      });

      it('blocks requests without required roles', async () => {
        const request = new NextRequest('http://localhost:3000/api/test');
        const wrappedHandler = requireRoles(mockHandler, 'ADMIN');

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(403);
        expect(mockHandler).not.toHaveBeenCalled();
      });
    });

    describe('requirePermissions', () => {
      it('creates a middleware that requires specific permissions', async () => {
        const request = new NextRequest('http://localhost:3000/api/test');
        const wrappedHandler = requirePermissions(mockHandler, 'read:profile');

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
      });

      it('accepts multiple permissions', async () => {
        const request = new NextRequest('http://localhost:3000/api/test');
        const wrappedHandler = requirePermissions(
          mockHandler, 
          'admin:all', 
          'read:profile'
        );

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(200);
        expect(mockHandler).toHaveBeenCalled();
      });

      it('blocks requests without required permissions', async () => {
        const request = new NextRequest('http://localhost:3000/api/test');
        const wrappedHandler = requirePermissions(mockHandler, 'admin:delete');

        const response = await wrappedHandler(request);
        
        expect(response.status).toBe(403);
        expect(mockHandler).not.toHaveBeenCalled();
      });
    });
  });

  describe('Complex Authorization Scenarios', () => {
    it('handles both role and permission checks together', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: ['USER'],
        permissions: ['read:profile'],
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('blocks when role check passes but permission check fails', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: ['USER'],
        permissions: ['admin:all'],
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('blocks when permission check passes but role check fails', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: ['ADMIN'],
        permissions: ['read:profile'],
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles requests without user in session', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: null });
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: true });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('handles malformed session objects', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ malformed: 'session' });
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, { required: true });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('handles empty roles array', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: [],
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('handles empty permissions array', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        permissions: [],
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('handles undefined role in user object', async () => {
      const sessionWithoutRole = {
        ...mockSession,
        user: {
          ...mockSession.user,
          role: undefined,
        },
      };
      
      (getServerSession as jest.Mock).mockResolvedValue(sessionWithoutRole);
      
      const request = new NextRequest('http://localhost:3000/api/test');
      const wrappedHandler = withAuth(mockHandler, {
        required: true,
        roles: ['USER'],
      });

      const response = await wrappedHandler(request);
      
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('preserves original request properties', async () => {
      const request = new NextRequest('http://localhost:3000/api/test?param=value', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
      });
      
      const wrappedHandler = withAuth(mockHandler, { required: true });

      await wrappedHandler(request);
      
      const calledRequest = (mockHandler.mock.calls as any)[0]?.[0];
      expect(calledRequest?.method).toBe('POST');
      expect(calledRequest?.url).toBe('http://localhost:3000/api/test?param=value');
      expect(calledRequest?.headers.get('content-type')).toBe('application/json');
    });
  });
});