import * as webpush from 'web-push';
import { prisma } from './prisma';
import { logger } from './logger';

// Configuration constants
const NOTIFICATION_CONFIG = {
  BATCH_SIZE: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '50'),
  RETRY_ATTEMPTS: parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS || '3'),
  MAX_TITLE_LENGTH: 100,
  MAX_BODY_LENGTH: 500,
};

// Configure web-push
const isWebPushConfigured = process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT;

if (isWebPushConfigured) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  } catch (error) {
    logger.error('Failed to configure web-push VAPID details', error instanceof Error ? error : new Error(String(error)));
  }
} else {
  logger.warn('Web push notifications not configured. Missing VAPID environment variables.');
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export class NotificationService {
  // Validate notification payload
  private static validatePayload(payload: NotificationPayload): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!payload.title || payload.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (payload.title.length > NOTIFICATION_CONFIG.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${NOTIFICATION_CONFIG.MAX_TITLE_LENGTH} characters`);
    }

    if (!payload.body || payload.body.trim().length === 0) {
      errors.push('Body is required');
    } else if (payload.body.length > NOTIFICATION_CONFIG.MAX_BODY_LENGTH) {
      errors.push(`Body must be less than ${NOTIFICATION_CONFIG.MAX_BODY_LENGTH} characters`);
    }

    return { isValid: errors.length === 0, errors };
  }

  static async sendToUser(userId: string, payload: NotificationPayload): Promise<boolean> {
    try {
      // Validate payload
      const validation = this.validatePayload(payload);
      if (!validation.isValid) {
        logger.error('Invalid notification payload', new Error(`Validation failed: ${validation.errors.join(', ')}`));
        return false;
      }

      // Validate userId
      if (!userId || userId.trim().length === 0) {
        logger.error('Invalid userId provided for notification');
        return false;
      }

      // Store notification in database
      await prisma.notification.create({
        data: {
          userId: userId.trim(),
          title: payload.title.trim(),
          message: payload.body.trim(),
          notificationType: payload.tag || 'GENERAL',
          actionData: payload.data ? JSON.stringify(payload.data) : null,
        },
      });

      // Get user's push subscriptions (you'll need to add this to your schema)
      // For now, we'll just return true as if sent successfully
      logger.info('Notification stored successfully', { userId, title: payload.title });
      return true;
    } catch (error) {
      logger.error('Error sending notification', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  static async sendPushNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // Check if web push is configured
      if (!isWebPushConfigured) {
        logger.warn('Web push notifications not configured, skipping push notification');
        return false;
      }

      // Validate payload
      const validation = this.validatePayload(payload);
      if (!validation.isValid) {
        logger.error('Invalid push notification payload', new Error(`Validation failed: ${validation.errors.join(', ')}`));
        return false;
      }

      // Validate subscription
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        logger.error('Invalid push subscription provided');
        return false;
      }

      await webpush.sendNotification(
        subscription,
        JSON.stringify(payload),
        {
          urgency: 'normal',
          TTL: 24 * 60 * 60, // 24 hours
          topic: payload.tag || 'general',
        }
      );
      
      logger.info('Push notification sent successfully', { endpoint: subscription.endpoint.substring(0, 50) + '...' });
      return true;
    } catch (error) {
      logger.error('Error sending push notification', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  static async sendStudyReminder(userId: string, session: any): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '📚 Study Time!',
      body: `Time for your ${session.title} session. Let's get started!`,
      icon: '/icons/study-reminder.png',
      tag: 'study-reminder',
      data: {
        type: 'study_reminder',
        sessionId: session.id,
        url: `/dashboard/sessions/${session.id}`,
      },
      actions: [
        {
          action: 'start',
          title: 'Start Now',
          icon: '/icons/play.png',
        },
        {
          action: 'postpone',
          title: 'Postpone 15min',
          icon: '/icons/clock.png',
        },
      ],
      requireInteraction: true,
    };

    return await this.sendToUser(userId, payload);
  }

  static async sendDeadlineAlert(userId: string, assignment: any): Promise<boolean> {
    const daysUntilDue = Math.ceil(
      (new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    let urgencyLevel = 'medium';
    let icon = '/icons/deadline.png';
    let title = '⏰ Deadline Reminder';

    if (daysUntilDue <= 1) {
      urgencyLevel = 'urgent';
      icon = '/icons/urgent.png';
      title = '🚨 Urgent: Deadline Today!';
    } else if (daysUntilDue <= 3) {
      urgencyLevel = 'high';
      icon = '/icons/warning.png';
      title = '⚠️ Deadline Approaching';
    }

    const payload: NotificationPayload = {
      title,
      body: `${assignment.title} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
      icon,
      tag: 'deadline-alert',
      data: {
        type: 'deadline_alert',
        assignmentId: assignment.id,
        urgency: urgencyLevel,
        url: `/dashboard/assignments/${assignment.id}`,
      },
      actions: [
        {
          action: 'view',
          title: 'View Assignment',
          icon: '/icons/view.png',
        },
        {
          action: 'schedule',
          title: 'Schedule Study Time',
          icon: '/icons/calendar.png',
        },
      ],
      requireInteraction: urgencyLevel === 'urgent',
    };

    return await this.sendToUser(userId, payload);
  }

  static async sendPartnerRequest(userId: string, requester: any): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '🤝 New Study Partner Request',
      body: `${requester.name} wants to be your study partner!`,
      icon: '/icons/partner-request.png',
      tag: 'partner-request',
      data: {
        type: 'partner_request',
        requesterId: requester.id,
        url: '/dashboard/partners',
      },
      actions: [
        {
          action: 'accept',
          title: 'Accept',
          icon: '/icons/check.png',
        },
        {
          action: 'view',
          title: 'View Profile',
          icon: '/icons/profile.png',
        },
      ],
      requireInteraction: true,
    };

    return await this.sendToUser(userId, payload);
  }

  static async sendAchievementUnlocked(userId: string, achievement: any): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '🏆 Achievement Unlocked!',
      body: `Congratulations! You earned "${achievement.name}"`,
      icon: achievement.icon || '/icons/achievement.png',
      tag: 'achievement',
      data: {
        type: 'achievement',
        achievementId: achievement.id,
        url: '/dashboard/achievements',
      },
      actions: [
        {
          action: 'view',
          title: 'View Achievement',
          icon: '/icons/trophy.png',
        },
        {
          action: 'share',
          title: 'Share Progress',
          icon: '/icons/share.png',
        },
      ],
      requireInteraction: false,
    };

    return await this.sendToUser(userId, payload);
  }

  static async sendStreakMaintenance(userId: string, streakDays: number): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '🔥 Keep Your Streak Alive!',
      body: `You're on a ${streakDays}-day study streak. Don't break it now!`,
      icon: '/icons/streak.png',
      tag: 'streak-maintenance',
      data: {
        type: 'streak_maintenance',
        streakDays,
        url: '/dashboard',
      },
      actions: [
        {
          action: 'study',
          title: 'Study Now',
          icon: '/icons/book.png',
        },
        {
          action: 'schedule',
          title: 'Schedule Later',
          icon: '/icons/calendar.png',
        },
      ],
      requireInteraction: false,
    };

    return await this.sendToUser(userId, payload);
  }

  static async sendMotivationalMessage(userId: string, message: string): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '💪 You\'ve Got This!',
      body: message,
      icon: '/icons/motivation.png',
      tag: 'motivation',
      data: {
        type: 'motivation',
        url: '/dashboard',
      },
      requireInteraction: false,
      silent: false,
    };

    return await this.sendToUser(userId, payload);
  }

  static async sendPartnerActivity(userId: string, partner: any, activity: string): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '👥 Partner Update',
      body: `${partner.name} ${activity}`,
      icon: '/icons/partner.png',
      tag: 'partner-activity',
      data: {
        type: 'partner_activity',
        partnerId: partner.id,
        url: '/dashboard/partners',
      },
      actions: [
        {
          action: 'view',
          title: 'View Activity',
          icon: '/icons/activity.png',
        },
        {
          action: 'message',
          title: 'Send Message',
          icon: '/icons/message.png',
        },
      ],
      requireInteraction: false,
    };

    return await this.sendToUser(userId, payload);
  }

  // Smart notification scheduling based on user behavior
  static async scheduleSmartReminders(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          sessionParticipations: {
            where: {
              studySession: {
                startTime: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
              },
            },
            include: {
              studySession: true,
            },
            take: 50, // Limit to prevent memory issues
          },
          goals: {
            where: { status: 'ACTIVE' },
            take: 20, // Limit active goals
          },
          reminders: {
            where: {
              dueDate: {
                gte: new Date(),
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
              },
            },
            take: 20, // Limit upcoming reminders
          },
        },
      });

      if (!user) return;

      // Analyze study patterns and schedule intelligent reminders
      const studySessions = (user.sessionParticipations || []).map(p => p.studySession).filter(Boolean);
      const studyTimes = studySessions.map((s: any) => new Date(s.startTime || s.createdAt).getHours());
      const preferredStudyHour = this.getMostFrequentStudyTime(studyTimes);
      
      // Schedule daily study reminder
      if ((user.currentStreak || 0) > 0) {
        // User has an active streak - send gentle reminder
        setTimeout(() => {
          this.sendStreakMaintenance(userId, user.currentStreak || 0);
        }, this.getMillisecondsUntilHour(preferredStudyHour));
      }

      // Check if user hasn't studied today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const studiedToday = studySessions.some((s: any) => {
        const sessionDate = new Date(s.startTime || s.createdAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });

      if (!studiedToday && new Date().getHours() >= preferredStudyHour) {
        // Send study reminder if they haven't studied today
        this.sendStudyReminder(userId, {
          id: 'daily-reminder',
          title: 'Daily Study Session',
        });
      }

    } catch (error) {
      logger.error('Error scheduling smart reminders', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private static getMostFrequentStudyTime(hours: number[]): number {
    if (hours.length === 0) return 9; // Default to 9 AM

    const frequency: { [key: number]: number } = {};
    hours.forEach(hour => {
      frequency[hour] = (frequency[hour] || 0) + 1;
    });

    return Object.keys(frequency).reduce((a, b) => 
      frequency[parseInt(a)] > frequency[parseInt(b)] ? a : b
    ).valueOf() as unknown as number;
  }

  private static getMillisecondsUntilHour(targetHour: number): number {
    const now = new Date();
    const target = new Date();
    target.setHours(targetHour, 0, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1); // Next day
    }

    return target.getTime() - now.getTime();
  }

  // Batch notification methods
  static async sendBulkNotifications(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    // Validate inputs
    if (!Array.isArray(userIds) || userIds.length === 0) {
      logger.error('Invalid userIds array provided for bulk notifications');
      return { sent: 0, failed: 0 };
    }

    const validation = this.validatePayload(payload);
    if (!validation.isValid) {
      logger.error('Invalid payload for bulk notifications', new Error(`Validation failed: ${validation.errors.join(', ')}`));
      return { sent: 0, failed: userIds.length };
    }

    let sent = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the system
    const batchSize = NOTIFICATION_CONFIG.BATCH_SIZE;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (userId) => {
        try {
          const success = await this.sendToUser(userId, payload);
          return success;
        } catch (error) {
          logger.error('Error in bulk notification batch', error instanceof Error ? error : new Error(String(error)));
          return false;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          sent++;
        } else {
          failed++;
        }
      }

      // Add small delay between batches to prevent rate limiting
      if (i + batchSize < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logger.info('Bulk notifications completed', { sent, failed, total: userIds.length });
    return { sent, failed };
  }

  // Mark notifications as read
  static async markAsRead(userId: string, notificationIds: string[]): Promise<boolean> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
        },
        data: {
          isRead: true,
        },
      });
      return true;
    } catch (error) {
      logger.error('Error marking notifications as read', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      logger.error('Error fetching user notifications', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }
}

export default NotificationService;