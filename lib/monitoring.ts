import { logger } from './logger';

interface MetricData {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
}

interface SecurityEvent {
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  timestamp: number;
}

interface UserMetric {
  userId: string;
  metricType: string;
  value: number;
  date: Date;
}

class Monitoring {
  private metrics: Map<string, MetricData[]> = new Map();
  private performanceData: PerformanceMetric[] = [];
  private securityEvents: SecurityEvent[] = [];
  private userMetrics: UserMetric[] = [];
  private alerts: any[] = [];

  // Performance monitoring
  recordAPIPerformance(endpoint: string, method: string, responseTime: number, statusCode: number) {
    const metric: PerformanceMetric = {
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: Date.now(),
    };

    this.performanceData.push(metric);

    // Keep only last 1000 performance records
    if (this.performanceData.length > 1000) {
      this.performanceData = this.performanceData.slice(-1000);
    }

    // Alert on slow responses
    if (responseTime > 5000) {
      this.createAlert('slow_response', 'high', {
        endpoint,
        method,
        responseTime,
        statusCode,
      });
    }

    // Alert on high error rates
    if (statusCode >= 500) {
      this.createAlert('high_error_rate', 'critical', {
        endpoint,
        method,
        statusCode,
      });
    }
  }

  getPerformanceMetrics(endpoint?: string, timeRange?: { start: number; end: number }) {
    let filtered = this.performanceData;

    if (endpoint) {
      filtered = filtered.filter((m: any) => m.endpoint === endpoint);
    }

    if (timeRange) {
      filtered = filtered.filter((m: any) => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    if (filtered.length === 0) {
      return {
        avgResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      };
    }

    const responseTimes = filtered.map((m: any) => m.responseTime).sort((a, b) => a - b);
    const errorCount = filtered.filter((m: any) => m.statusCode >= 400).length;

    return {
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      totalRequests: filtered.length,
      errorRate: (errorCount / filtered.length) * 100,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
    };
  }

  // Security monitoring
  recordSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', data: any) {
    const securityEvent: SecurityEvent = {
      event,
      severity,
      data,
      timestamp: Date.now(),
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 1000 security events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Create alert for high/critical security events
    if (severity === 'high' || severity === 'critical') {
      this.createAlert('security_event', severity, {
        event,
        data,
      });
    }
  }

  getSecurityEvents(timeRange?: { start: number; end: number }) {
    let filtered = this.securityEvents;

    if (timeRange) {
      filtered = filtered.filter((e: any) => 
        e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
      );
    }

    return filtered;
  }

  // User metrics tracking
  recordUserMetric(userId: string, metricType: string, value: number) {
    const userMetric: UserMetric = {
      userId,
      metricType,
      value,
      date: new Date(),
    };

    this.userMetrics.push(userMetric);

    // Keep only last 10000 user metrics
    if (this.userMetrics.length > 10000) {
      this.userMetrics = this.userMetrics.slice(-10000);
    }
  }

  getUserMetrics(userId: string, metricType?: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let filtered = this.userMetrics.filter((m: any) => 
      m.user1Id === userId && m.date >= cutoffDate
    );

    if (metricType) {
      filtered = filtered.filter((m: any) => m.metricType === metricType);
    }

    return filtered;
  }

  // Custom metrics
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metricData: MetricData = {
      timestamp: Date.now(),
      value,
      tags,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metricData);

    // Keep only last 1000 data points per metric
    const metricArray = this.metrics.get(name)!;
    if (metricArray.length > 1000) {
      this.metrics.set(name, metricArray.slice(-1000));
    }
  }

  getMetric(name: string, timeRange?: { start: number; end: number }) {
    const metricData = this.metrics.get(name) || [];

    if (timeRange) {
      return metricData.filter((m: any) => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    return metricData;
  }

  // Alerting system
  createAlert(type: string, severity: 'low' | 'medium' | 'high' | 'critical', data: any) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      data,
      timestamp: Date.now(),
      acknowledged: false,
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // In production, you might want to send alerts to external services
    this.sendAlert(alert);
  }

  getAlerts(severity?: 'low' | 'medium' | 'high' | 'critical') {
    let filtered = this.alerts;

    if (severity) {
      filtered = filtered.filter((a: any) => a.severity === severity);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  private sendAlert(alert: any) {
    // Implement external alerting service integration here
    // Examples: Slack, Discord, email, PagerDuty, etc.
    
    if (process.env.SLACK_WEBHOOK_URL) {
      // Send to Slack
      this.sendSlackAlert(alert);
    }

    if (process.env.DISCORD_WEBHOOK_URL) {
      // Send to Discord
      this.sendDiscordAlert(alert);
    }

    // Log alert
    // Alert logged via external services (Slack, Discord, etc.)
  }

  private async sendSlackAlert(alert: any) {
    try {
      const message = {
        text: `🚨 *${alert.type.toUpperCase()} Alert*`,
        attachments: [
          {
            color: this.getSeverityColor(alert.severity),
            fields: [
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true,
              },
              {
                title: 'Time',
                value: new Date(alert.timestamp).toISOString(),
                short: true,
              },
              {
                title: 'Details',
                value: JSON.stringify(alert.data, null, 2),
                short: false,
              },
            ],
          },
        ],
      };

      await fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      logger.error('Failed to send Slack alert', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async sendDiscordAlert(alert: any) {
    try {
      const message = {
        embeds: [
          {
            title: `🚨 ${alert.type.toUpperCase()} Alert`,
            color: this.getSeverityColor(alert.severity),
            fields: [
              {
                name: 'Severity',
                value: alert.severity.toUpperCase(),
                inline: true,
              },
              {
                name: 'Time',
                value: new Date(alert.timestamp).toISOString(),
                inline: true,
              },
              {
                name: 'Details',
                value: JSON.stringify(alert.data, null, 2),
                inline: false,
              },
            ],
            timestamp: new Date(alert.timestamp).toISOString(),
          },
        ],
      };

      await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      logger.error('Failed to send Discord alert', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private getSeverityColor(severity: string): number {
    switch (severity) {
      case 'critical': return 0xFF0000; // Red
      case 'high': return 0xFFA500; // Orange
      case 'medium': return 0xFFFF00; // Yellow
      case 'low': return 0x00FF00; // Green
      default: return 0x808080; // Gray
    }
  }

  // Health checks
  getHealthStatus() {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    const recentPerformance = this.getPerformanceMetrics(undefined, {
      start: fiveMinutesAgo,
      end: now,
    });

    const recentSecurityEvents = this.getSecurityEvents({
      start: fiveMinutesAgo,
      end: now,
    });

    const criticalAlerts = this.getAlerts('critical').filter((a: any) => !a.acknowledged);

    return {
      status: this.determineOverallStatus(recentPerformance, recentSecurityEvents, criticalAlerts),
      performance: recentPerformance,
      security: {
        totalEvents: recentSecurityEvents.length,
        highSeverityEvents: recentSecurityEvents.filter((e: any) => e.severity === 'high').length,
        criticalEvents: recentSecurityEvents.filter((e: any) => e.severity === 'critical').length,
      },
      alerts: {
        total: this.alerts.filter((a: any) => !a.acknowledged).length,
        critical: criticalAlerts.length,
      },
      uptime: this.calculateUptime(),
    };
  }

  private determineOverallStatus(
    performance: any,
    securityEvents: SecurityEvent[],
    criticalAlerts: any[]
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Check for critical alerts
    if (criticalAlerts.length > 0) {
      return 'unhealthy';
    }

    // Check for high error rate
    if (performance.errorRate > 10) {
      return 'unhealthy';
    }

    // Check for slow response times
    if (performance.avgResponseTime > 3000) {
      return 'degraded';
    }

    // Check for security issues
    const criticalSecurityEvents = securityEvents.filter((e: any) => e.severity === 'critical');
    if (criticalSecurityEvents.length > 0) {
      return 'unhealthy';
    }

    return 'healthy';
  }

  private calculateUptime(): number {
    // This is a simplified uptime calculation
    // In production, you'd want to track actual uptime from your infrastructure
    return 99.9; // Placeholder
  }

  // Dashboard data
  getDashboardData() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return {
      performance: {
        lastHour: this.getPerformanceMetrics(undefined, { start: oneHourAgo, end: now }),
        lastDay: this.getPerformanceMetrics(undefined, { start: oneDayAgo, end: now }),
      },
      security: {
        lastHour: this.getSecurityEvents({ start: oneHourAgo, end: now }),
        lastDay: this.getSecurityEvents({ start: oneDayAgo, end: now }),
      },
      alerts: {
        unacknowledged: this.alerts.filter((a: any) => !a.acknowledged),
        recent: this.alerts.slice(-10),
      },
      metrics: {
        totalUsers: this.getMetric('total_users').slice(-1)[0]?.value || 0,
        activeSessions: this.getMetric('active_sessions').slice(-1)[0]?.value || 0,
        studySessionsCreated: this.getMetric('study_sessions_created').slice(-1)[0]?.value || 0,
      },
    };
  }

  // Cleanup old data
  cleanup() {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Clean up old performance data
    this.performanceData = this.performanceData.filter((p: any) => p.timestamp > oneWeekAgo);

    // Clean up old security events
    this.securityEvents = this.securityEvents.filter((e: any) => e.timestamp > oneWeekAgo);

    // Clean up old user metrics
    this.userMetrics = this.userMetrics.filter((m: any) => m.date.getTime() > oneWeekAgo);

    // Clean up old custom metrics
    this.metrics.forEach((data, name) => {
      this.metrics.set(name, data.filter((d: MetricData) => d.timestamp > oneWeekAgo));
    });

    // Clean up old alerts (keep for 30 days)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter((a: any) => a.timestamp > thirtyDaysAgo);
  }
}

export const monitoring = new Monitoring();

// Run cleanup every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    monitoring.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}
