import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrivacyService } from '@/lib/privacy';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';

export const GET = withRateLimit(apiLimiter, async (request: NextRequest) => {
  const startTime = Date.now();
  const context = logger.logRequest(request);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const privacySettings = await PrivacyService.getUserPrivacySettings(user.id);

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/privacy', 'GET', responseTime, 200);
    logger.logResponse(context, 200, responseTime);

    return NextResponse.json({
      privacySettings,
      dataRights: {
        export: privacySettings.dataExportEnabled,
        deletion: true,
        rectification: true,
        portability: true,
      },
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/privacy', 'GET', responseTime, 500);
    logger.error('Privacy settings error:', error as Error, context);

    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
});

export const POST = withRateLimit(apiLimiter, async (request: NextRequest) => {
  const startTime = Date.now();
  const context = logger.logRequest(request);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, settings } = body;

    switch (action) {
      case 'update_settings':
        await PrivacyService.updatePrivacySettings(user.id, settings);
        break;
      
      case 'export_data':
        if (!settings.dataExportEnabled) {
          return NextResponse.json(
            { error: 'Data export is disabled' },
            { status: 403 }
          );
        }
        const exportData = await PrivacyService.exportUserData(user.id);
        return NextResponse.json({
          message: 'Data export completed',
          data: exportData,
        });
      
      case 'delete_data':
        await PrivacyService.deleteUserData(user.id);
        return NextResponse.json({
          message: 'Account and data deleted successfully',
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/privacy', 'POST', responseTime, 200);
    logger.logResponse(context, 200, responseTime);

    return NextResponse.json({
      message: 'Privacy settings updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/privacy', 'POST', responseTime, 500);
    logger.error('Privacy action error:', error as Error, context);

    return NextResponse.json(
      { error: 'Failed to process privacy action' },
      { status: 500 }
    );
  }
});
