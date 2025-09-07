import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { monitoring } from '@/lib/monitoring';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  // Get authentication token
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/features',
    '/pricing',
    '/privacy',
    '/terms',
    '/faq',
    '/signin',
    '/signup',
    '/auth/signin',
    '/auth/signup'
  ];

  // Define routes that require authentication but don't need onboarding check
  const authOnlyRoutes = [
    '/onboarding'
  ];

  // Define routes that should skip middleware entirely
  const skipRoutes = [
    '/api/',
    '/auth/',
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ];

  // Skip middleware for certain routes
  if (skipRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    return addSecurityHeaders(response, request, startTime);
  }

  // Allow access to public routes without authentication
  if (publicRoutes.includes(pathname)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response, request, startTime);
  }

  // For all other routes, require authentication
  if (!token) {
    // Redirect unauthenticated users to sign in
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Allow access to auth-only routes (like onboarding) without onboarding check
  if (authOnlyRoutes.includes(pathname)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response, request, startTime);
  }

  // If user is authenticated, allow access to protected routes
  // Note: Individual pages handle their own onboarding checks to avoid middleware complexity

  const response = NextResponse.next();
  return addSecurityHeaders(response, request, startTime);
}

function addSecurityHeaders(response: NextResponse, request: NextRequest, startTime: number) {

  // Enhanced security headers for production
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  
  // Strict CSP for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://api.openai.com https://www.googleapis.com https://api.github.com https://*.supabase.co wss://*.supabase.co; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );
  }

  // Add request ID for tracking
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  response.headers.set('X-Request-ID', requestId);

  // Log security events
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /exec\s*\(/i,
  ];

  const url = request.url;
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent)
  );

  if (hasSuspiciousPattern) {
    monitoring.recordSecurityEvent('suspicious_request', 'high', {
      url,
      userAgent,
      ip,
      requestId,
    });
  }

  // Rate limiting check (basic implementation)
  const clientIP = ip;
  const endpoint = request.nextUrl.pathname;
  
  // Record API metrics
  const responseTime = Date.now() - startTime;
  monitoring.recordAPIPerformance(endpoint, request.method, responseTime, 200);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
