import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: string[];
  permissions?: string[];
  onUnauthorized?: () => NextResponse;
  onForbidden?: () => NextResponse;
}

/**
 * Authentication middleware for API routes
 */
export function withAuth(
  handler: (
    req: NextRequest & {
      user?: any;
      session?: any;
    }
  ) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (req: NextRequest) => {
    const context = logger.logRequest(req);
    
    try {
      const session = await getServerSession(authOptions);
      
      // Attach session and user to request
      (req as any).session = session;
      (req as any).user = session?.user;

      // Check if authentication is required
      if (options.required && !session?.user) {
        logger.warn('Unauthorized access attempt', context);
        
        if (options.onUnauthorized) {
          return options.onUnauthorized();
        }
        
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
            message: 'You must be logged in to access this resource'
          },
          { status: 401 }
        );
      }

      // Check roles if specified
      if (options.roles && session?.user) {
        const userRole = (session.user as any).role;
        if (!options.roles.includes(userRole)) {
          logger.warn('Access denied - insufficient role', {
            ...context,
            userRole,
            requiredRoles: options.roles
          });
          
          if (options.onForbidden) {
            return options.onForbidden();
          }
          
          return NextResponse.json(
            {
              success: false,
              error: 'Insufficient permissions',
              message: 'You do not have permission to access this resource'
            },
            { status: 403 }
          );
        }
      }

      // Check permissions if specified
      if (options.permissions && session?.user) {
        const userPermissions = (session.user as any).permissions || [];
        const hasPermission = options.permissions.some(permission =>
          userPermissions.includes(permission)
        );
        
        if (!hasPermission) {
          logger.warn('Access denied - insufficient permissions', {
            ...context,
            userPermissions,
            requiredPermissions: options.permissions
          });
          
          if (options.onForbidden) {
            return options.onForbidden();
          }
          
          return NextResponse.json(
            {
              success: false,
              error: 'Insufficient permissions',
              message: 'You do not have the required permissions for this action'
            },
            { status: 403 }
          );
        }
      }

      logger.logAPIRequest(
        new URL(req.url).pathname,
        req.method,
        session?.user?.id
      );

      return await handler(req);
    } catch (error) {
      logger.error('Auth middleware error', error instanceof Error ? error : new Error(String(error)), context);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Require authentication middleware
 */
export function requireAuth(
  handler: (_req: NextRequest & { user?: any; session?: any }) => Promise<NextResponse>
) {
  return withAuth(handler, { required: true });
}

/**
 * Require specific roles middleware
 */
export function requireRoles(
  handler: (_req: NextRequest & { user?: any; session?: any }) => Promise<NextResponse>,
  ...roles: string[]
) {
  return withAuth(handler, { required: true, roles });
}

/**
 * Require specific permissions middleware
 */
export function requirePermissions(
  handler: (_req: NextRequest & { user?: any; session?: any }) => Promise<NextResponse>,
  ...permissions: string[]
) {
  return withAuth(handler, { required: true, permissions });
}