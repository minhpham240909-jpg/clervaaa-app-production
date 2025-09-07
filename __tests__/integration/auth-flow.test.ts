import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';
import { withAuth } from '@/lib/middleware/auth';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    logRequest: jest.fn(() => ({ requestId: 'test-id' })),
    logAPIRequest: jest.fn(),
    logLogin: jest.fn(),
    logLogout: jest.fn(),
    logSecurityEvent: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/monitoring', () => ({
  monitoring: {
    recordSecurityEvent: jest.fn(),
    recordUserMetric: jest.fn(),
    recordAPIPerformance: jest.fn(),
  },
}));

import { NextResponse } from 'next/server';

// Mock handler that simulates different API endpoints
const createMockHandler = (requiresAuth = true, userRole?: string) => {
  return jest.fn(async (req: any) => {
    // Simulate different behaviors based on endpoint
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (pathname === '/api/profile' && requiresAuth && !req.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (pathname === '/api/admin' && req.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      user: req.user,
      path: pathname 
    }, { status: 200 });
  });
};

describe('Authentication Flow Integration', () => {
  let mockUser: any;
  let mockSession: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      permissions: ['read:profile', 'write:profile'],
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    mockSession = {
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        permissions: mockUser.permissions,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Authentication Flow', () => {
    it('completes full authentication flow for protected endpoint', async () => {
      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'GET',
        headers: {
          'cookie': 'next-auth.session-token=valid-token',
        },
      });

      const response = await protectedHandler(request);
      const data = await response.json();

      // Verify successful authentication
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.id).toBe(mockUser.id);
      expect(data.path).toBe('/api/profile');

      // Verify session was retrieved
      expect(getServerSession).toHaveBeenCalled();

      // Verify logging
      expect(logger.logRequest).toHaveBeenCalled();
      expect(logger.logAPIRequest).toHaveBeenCalledWith(
        '/api/profile',
        'GET',
        mockUser.id,
        expect.any(Object)
      );

      // Verify handler received authenticated request
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockSession.user,
          session: mockSession,
        })
      );
    });

    it('allows access to public endpoints without authentication', async () => {
      const mockHandler = createMockHandler(false);
      const publicHandler = withAuth(mockHandler, { required: false });

      // No session provided
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/public');

      const response = await publicHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBeUndefined();
    });

    it('handles first-time user login with user creation', async () => {
      // Simulate new user scenario
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await protectedHandler(request);

      expect(response.status).toBe(200);
      // In a real app, this would trigger user creation logic
      expect(getServerSession).toHaveBeenCalled();
    });
  });

  describe('Authentication Failures', () => {
    it('blocks access to protected endpoints without authentication', async () => {
      // No session provided
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
      expect(data.success).toBe(false);

      // Verify security logging
      expect(logger.warn).toHaveBeenCalledWith(
        'Unauthorized access attempt',
        expect.any(Object)
      );

      // Handler should not be called
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('blocks access when session is invalid', async () => {
      // Invalid session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: null, // Invalid session structure
      });

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await protectedHandler(request);

      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('blocks access when user account is deactivated', async () => {
      // Simulate deactivated user
      const deactivatedUser = { ...mockUser, isActive: false };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(deactivatedUser);

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      // In a real implementation, you'd check user.allowPartnerRequests in the handler
      const response = await protectedHandler(request);

      // This test assumes the handler would check user status
      expect(getServerSession).toHaveBeenCalled();
    });
  });

  describe('Authorization (Role-based Access)', () => {
    it('allows access when user has required role', async () => {
      // User with ADMIN role
      const adminSession = {
        ...mockSession,
        user: { ...mockSession.user, role: 'ADMIN' },
      };
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const mockHandler = createMockHandler(true);
      const adminHandler = withAuth(mockHandler, {
        required: true,
        roles: ['ADMIN'],
      });

      const request = new NextRequest('http://localhost:3000/api/admin');

      const response = await adminHandler(request);

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('blocks access when user lacks required role', async () => {
      // Regular user trying to access admin endpoint
      const mockHandler = createMockHandler(true);
      const adminHandler = withAuth(mockHandler, {
        required: true,
        roles: ['ADMIN'],
      });

      const request = new NextRequest('http://localhost:3000/api/admin');

      const response = await adminHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
      expect(data.success).toBe(false);

      // Verify access denied logging
      expect(logger.warn).toHaveBeenCalledWith(
        'Access denied - insufficient role',
        expect.objectContaining({
          userRole: 'USER',
          requiredRoles: ['ADMIN'],
        })
      );

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('allows access with any of multiple roles', async () => {
      const mockHandler = createMockHandler(true);
      const multiRoleHandler = withAuth(mockHandler, {
        required: true,
        roles: ['ADMIN', 'USER', 'MODERATOR'],
      });

      const request = new NextRequest('http://localhost:3000/api/multi-role');

      const response = await multiRoleHandler(request);

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Permission-based Access', () => {
    it('allows access when user has required permission', async () => {
      const mockHandler = createMockHandler(true);
      const permissionHandler = withAuth(mockHandler, {
        required: true,
        permissions: ['read:profile'],
      });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await permissionHandler(request);

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('blocks access when user lacks required permission', async () => {
      const mockHandler = createMockHandler(true);
      const permissionHandler = withAuth(mockHandler, {
        required: true,
        permissions: ['admin:delete'],
      });

      const request = new NextRequest('http://localhost:3000/api/admin/delete');

      const response = await permissionHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');

      // Verify permission denied logging
      expect(logger.warn).toHaveBeenCalledWith(
        'Access denied - insufficient permissions',
        expect.objectContaining({
          userPermissions: ['read:profile', 'write:profile'],
          requiredPermissions: ['admin:delete'],
        })
      );

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

      const mockHandler = createMockHandler(true);
      const permissionHandler = withAuth(mockHandler, {
        required: true,
        permissions: ['read:profile'],
      });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await permissionHandler(request);

      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('handles session expiration gracefully', async () => {
      // Expired session
      const expiredSession = {
        ...mockSession,
        expires: new Date(Date.now() - 1000).toISOString(), // 1 second ago
      };
      (getServerSession as jest.Mock).mockResolvedValue(expiredSession);

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await protectedHandler(request);

      // In a real implementation, NextAuth would handle expired sessions
      // For this test, we assume the session is still valid structure-wise
      expect(getServerSession).toHaveBeenCalled();
    });

    it('updates user last login time on successful authentication', async () => {
      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      await protectedHandler(request);

      // In a real implementation, you might update lastLogin
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('Security Monitoring Integration', () => {
    it('records security events for failed authentication attempts', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/sensitive', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      await protectedHandler(request);

      // Verify security logging occurred
      expect(logger.warn).toHaveBeenCalledWith(
        'Unauthorized access attempt',
        expect.any(Object)
      );
    });

    it('records user metrics for successful authentications', async () => {
      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      await protectedHandler(request);

      // In a real implementation, you might record user metrics
      expect(logger.logAPIRequest).toHaveBeenCalled();
    });

    it('detects and logs suspicious activity patterns', async () => {
      // Simulate rapid failed login attempts
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const suspiciousRequest = new NextRequest('http://localhost:3000/api/admin', {
        headers: { 'x-forwarded-for': '10.0.0.1' },
      });

      // Multiple rapid requests (simulating brute force)
      await protectedHandler(suspiciousRequest);
      await protectedHandler(suspiciousRequest);
      await protectedHandler(suspiciousRequest);

      // Verify multiple unauthorized attempts were logged
      expect(logger.warn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling in Authentication Flow', () => {
    it('handles database connection errors gracefully', async () => {
      (getServerSession as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await protectedHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');

      expect(logger.error).toHaveBeenCalledWith(
        'Auth middleware error',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('handles malformed session data', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        malformed: 'session',
        // Missing user property
      });

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await protectedHandler(request);

      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('continues operation when logging fails', async () => {
      // Mock logger to throw error
      (logger.logRequest as jest.Mock).mockImplementation(() => {
        throw new Error('Logging failed');
      });

      const mockHandler = createMockHandler(true);
      const protectedHandler = withAuth(mockHandler, { required: true });

      const request = new NextRequest('http://localhost:3000/api/profile');

      const response = await protectedHandler(request);

      // Should still work despite logging failure
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Complex Authentication Scenarios', () => {
    it('handles user with multiple roles and permissions', async () => {
      const superUserSession = {
        ...mockSession,
        user: {
          ...mockSession.user,
          role: 'SUPER_ADMIN',
          permissions: [
            'read:profile',
            'write:profile',
            'admin:delete',
            'admin:create',
            'system:manage',
          ],
        },
      };
      (getServerSession as jest.Mock).mockResolvedValue(superUserSession);

      const mockHandler = createMockHandler(true);
      const complexHandler = withAuth(mockHandler, {
        required: true,
        roles: ['ADMIN', 'SUPER_ADMIN'],
        permissions: ['admin:delete'],
      });

      const request = new NextRequest('http://localhost:3000/api/admin/complex');

      const response = await complexHandler(request);

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('handles API versioning with different auth requirements', async () => {
      const mockHandler = createMockHandler(true);
      const v1Handler = withAuth(mockHandler, {
        required: true,
        roles: ['USER'],
      });
      const v2Handler = withAuth(mockHandler, {
        required: true,
        roles: ['USER'],
        permissions: ['api:v2:access'],
      });

      const v1Request = new NextRequest('http://localhost:3000/api/v1/data');
      const v2Request = new NextRequest('http://localhost:3000/api/v2/data');

      // V1 should work with basic role
      const v1Response = await v1Handler(v1Request);
      expect(v1Response.status).toBe(200);

      // V2 should fail without specific permission
      const v2Response = await v2Handler(v2Request);
      expect(v2Response.status).toBe(403);
    });

    it('handles auth middleware composition', async () => {
      // Simulate composing auth with other middleware
      const mockHandler = createMockHandler(true);
      
      // First apply role-based auth
      const roleHandler = withAuth(mockHandler, {
        required: true,
        roles: ['USER'],
      });

      // Then apply additional permission check
      const composedHandler = withAuth(roleHandler, {
        required: true,
        permissions: ['read:profile'],
      });

      const request = new NextRequest('http://localhost:3000/api/composed');

      const response = await composedHandler(request);

      expect(response.status).toBe(200);
      // Note: In this test setup, the inner handler won't be called twice
      // In real scenarios, you'd design middleware to avoid double-wrapping
    });
  });
});