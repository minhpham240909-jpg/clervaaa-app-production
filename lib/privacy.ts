import { prisma } from './prisma';
import { logger } from './logger';

export interface PrivacySettings {
  dataRetentionDays: number;
  allowAnalytics: boolean;
  allowMarketing: boolean;
  allowThirdParty: boolean;
  dataExportEnabled: boolean;
}

export class PrivacyService {
  static readonly DEFAULT_RETENTION_DAYS = 365; // 1 year
  static readonly MAX_RETENTION_DAYS = 2555; // 7 years

  static async getUserPrivacySettings(userId: string): Promise<PrivacySettings> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!user?.preferences) {
      return this.getDefaultPrivacySettings();
    }

    try {
      const prefs = JSON.parse(user.preferences);
      return {
        dataRetentionDays: prefs.privacy?.dataRetentionDays || this.DEFAULT_RETENTION_DAYS,
        allowAnalytics: prefs.privacy?.allowAnalytics ?? true,
        allowMarketing: prefs.privacy?.allowMarketing ?? false,
        allowThirdParty: prefs.privacy?.allowThirdParty ?? false,
        dataExportEnabled: prefs.privacy?.dataExportEnabled ?? true,
      };
    } catch {
      return this.getDefaultPrivacySettings();
    }
  }

  static async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<void> {
    const currentSettings = await this.getUserPrivacySettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };

    // Validate retention days
    if (updatedSettings.dataRetentionDays > this.MAX_RETENTION_DAYS) {
      throw new Error('Data retention period exceeds maximum allowed');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: JSON.stringify({
          privacy: updatedSettings
        })
      }
    });
  }

  static async exportUserData(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSubjects: { include: { subject: true } },
        goals: true,
        personalStudySessions: true,
        partnerships1: { include: { user2: { select: { id: true, name: true } } } },
        partnerships2: { include: { user1: { select: { id: true, name: true } } } },
        chatbotMessages: true,
        notifications: true,
        reminders: true,
        assignments: true,
        calendarEvents: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    const exportData = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        university: user.institution,
        major: user.major,
        year: user.graduationYear,
        studyLevel: user.academicLevel,
        learningStyle: user.learningStyle,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      subjects: user.userSubjects,
      goals: user.goals,
      studySessions: user.personalStudySessions,
      partnerships: [...(user.partnerships1 || []), ...(user.partnerships2 || [])],
      chatbotMessages: user.chatbotMessages,
      notifications: user.notifications,
      reminders: user.reminders,
      assignments: user.assignments,
      events: user.calendarEvents,
      exportDate: new Date().toISOString(),
    };

    return exportData;
  }

  static async deleteUserData(userId: string): Promise<void> {
    // This will cascade delete all related data due to Prisma schema configuration
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  static async cleanupExpiredData(): Promise<{ deleted: number; errors: number }> {
    let deleted = 0;
    let errors = 0;

    try {
      // Get all users with their privacy settings
      const users = await prisma.user.findMany({
        select: { id: true, preferences: true, createdAt: true }
      });

      for (const user of users) {
        try {
          const settings = await this.getUserPrivacySettings(user.id);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetentionDays);

          // Delete old data
          const result = await prisma.$transaction([
            prisma.chatbotMessage.deleteMany({
              where: {
                userId: user.id,
                createdAt: { lt: cutoffDate }
              }
            }),
            prisma.notification.deleteMany({
              where: {
                userId: user.id,
                createdAt: { lt: cutoffDate }
              }
            }),
            prisma.personalStudySession.deleteMany({
              where: {
                userId: user.id,
                createdAt: { lt: cutoffDate }
              }
            }),
          ]);

          deleted += result.reduce((sum, r) => sum + r.count, 0);
        } catch (error) {
          logger.error(`Error cleaning up data for user ${user.id}`, error instanceof Error ? error : new Error(String(error)));
          errors++;
        }
      }
    } catch (error) {
      logger.error('Error in data cleanup', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to clean up user data');
    }

    return { deleted, errors };
  }

  private static getDefaultPrivacySettings(): PrivacySettings {
    return {
      dataRetentionDays: this.DEFAULT_RETENTION_DAYS,
      allowAnalytics: true,
      allowMarketing: false,
      allowThirdParty: false,
      dataExportEnabled: true,
    };
  }
}
