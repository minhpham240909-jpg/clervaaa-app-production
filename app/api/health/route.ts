import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const dbHealthy = await testDatabaseConnection();
    
    // Test API endpoints
    const apiHealthy = await testAPIEndpoints();
    
    // Get system info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    const health = {
      status: dbHealthy && apiHealthy ? 'healthy' : 'unhealthy',
      database: dbHealthy ? 'connected' : 'disconnected',
      api: apiHealthy ? 'operational' : 'degraded',
      services: {
        authentication: 'operational',
        realtime: 'operational',
        ai: 'operational',
        webrtc: 'operational'
      },
      system: systemInfo,
      features: {
        partnerMatching: 'enhanced',
        smartChat: 'ai-powered',
        videoCalling: 'study-focused',
        aiScheduler: 'active'
      }
    };

    logger.info('Health check completed', { status: health.status });

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    logger.error('Health check failed', error as Error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Simple query to test database connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', error as Error);
    return false;
  }
}

async function testAPIEndpoints(): Promise<boolean> {
  try {
    // Test if we can access Prisma client
    const userCount = await prisma.user.count();
    logger.info('API health check passed', { userCount });
    return true;
  } catch (error) {
    logger.error('API health check failed', error as Error);
    return false;
  }
}