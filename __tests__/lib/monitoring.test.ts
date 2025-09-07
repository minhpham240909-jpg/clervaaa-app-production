import { monitoring } from '@/lib/monitoring';
import { logger } from '@/lib/logger';

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock fetch for external alert services
global.fetch = jest.fn();

// Mock environment variables
const mockEnv = {
  SLACK_WEBHOOK_URL: 'https://hooks.slack.com/test',
  DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/test',
};

describe('Monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key];
    });
    // Clear monitoring data
    monitoring['performanceData'] = [];
    monitoring['securityEvents'] = [];
    monitoring['userMetrics'] = [];
    monitoring['alerts'] = [];
    monitoring['metrics'].clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Performance Monitoring', () => {
    it('records API performance metrics', () => {
      monitoring.recordAPIPerformance('/api/test', 'GET', 250, 200);

      const metrics = monitoring.getPerformanceMetrics('/api/test');
      expect(metrics.avgResponseTime).toBe(250);
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.errorRate).toBe(0);
    });

    it('calculates performance metrics correctly', () => {
      monitoring.recordAPIPerformance('/api/test', 'GET', 100, 200);
      monitoring.recordAPIPerformance('/api/test', 'GET', 200, 200);
      monitoring.recordAPIPerformance('/api/test', 'GET', 300, 400);

      const metrics = monitoring.getPerformanceMetrics('/api/test');
      expect(metrics.avgResponseTime).toBe(200);
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.errorRate).toBe(33.33333333333333); // 1 error out of 3
    });

    it('calculates percentiles correctly', () => {
      const responseTimes = [100, 200, 300, 400, 500];
      responseTimes.forEach(time => {
        monitoring.recordAPIPerformance('/api/test', 'GET', time, 200);
      });

      const metrics = monitoring.getPerformanceMetrics('/api/test');
      expect(metrics.p95ResponseTime).toBe(500); // 95th percentile
      expect(metrics.p99ResponseTime).toBe(500); // 99th percentile
    });

    it('filters metrics by endpoint', () => {
      monitoring.recordAPIPerformance('/api/test1', 'GET', 100, 200);
      monitoring.recordAPIPerformance('/api/test2', 'GET', 200, 200);

      const metrics1 = monitoring.getPerformanceMetrics('/api/test1');
      const metrics2 = monitoring.getPerformanceMetrics('/api/test2');

      expect(metrics1.totalRequests).toBe(1);
      expect(metrics2.totalRequests).toBe(1);
      expect(metrics1.avgResponseTime).toBe(100);
      expect(metrics2.avgResponseTime).toBe(200);
    });

    it('filters metrics by time range', () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Mock timestamp for older metric
      monitoring['performanceData'].push({
        endpoint: '/api/test',
        method: 'GET',
        responseTime: 100,
        statusCode: 200,
        timestamp: oneHourAgo - 1000,
      });

      monitoring.recordAPIPerformance('/api/test', 'GET', 200, 200);

      const metrics = monitoring.getPerformanceMetrics('/api/test', {
        start: oneHourAgo,
        end: now,
      });

      expect(metrics.totalRequests).toBe(1);
      expect(metrics.avgResponseTime).toBe(200);
    });

    it('creates alert for slow responses', () => {
      monitoring.recordAPIPerformance('/api/slow', 'GET', 6000, 200);

      const alerts = monitoring.getAlerts('high');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('slow_response');
      expect(alerts[0].data.responseTime).toBe(6000);
    });

    it('creates alert for server errors', () => {
      monitoring.recordAPIPerformance('/api/error', 'GET', 100, 500);

      const alerts = monitoring.getAlerts('critical');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('high_error_rate');
      expect(alerts[0].data.statusCode).toBe(500);
    });

    it('limits performance data storage', () => {
      // Add 1001 performance records
      for (let i = 0; i < 1001; i++) {
        monitoring.recordAPIPerformance(`/api/test${i}`, 'GET', 100, 200);
      }

      expect(monitoring['performanceData']).toHaveLength(1000);
    });
  });

  describe('Security Monitoring', () => {
    it('records security events', () => {
      monitoring.recordSecurityEvent('suspicious_login', 'medium', {
        userId: 'test-user',
        ip: '192.168.1.1',
      });

      const events = monitoring.getSecurityEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('suspicious_login');
      expect(events[0].severity).toBe('medium');
      expect(events[0].data.user1Id).toBe('test-user');
    });

    it('creates alerts for high severity security events', () => {
      monitoring.recordSecurityEvent('brute_force_attack', 'critical', {
        ip: '192.168.1.1',
      });

      const alerts = monitoring.getAlerts('critical');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('security_event');
    });

    it('filters security events by time range', () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Add old event manually
      monitoring['securityEvents'].push({
        event: 'old_event',
        severity: 'low',
        data: {},
        timestamp: oneHourAgo - 1000,
      });

      monitoring.recordSecurityEvent('new_event', 'medium', {});

      const events = monitoring.getSecurityEvents({
        start: oneHourAgo,
        end: now,
      });

      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('new_event');
    });

    it('limits security events storage', () => {
      // Add 1001 security events
      for (let i = 0; i < 1001; i++) {
        monitoring.recordSecurityEvent(`event_${i}`, 'low', {});
      }

      expect(monitoring['securityEvents']).toHaveLength(1000);
    });
  });

  describe('User Metrics', () => {
    it('records user metrics', () => {
      monitoring.recordUserMetric('user-123', 'login_count', 5);

      const metrics = monitoring.getUserMetrics('user-123', 'login_count');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(5);
    });

    it('filters user metrics by type', () => {
      monitoring.recordUserMetric('user-123', 'login_count', 5);
      monitoring.recordUserMetric('user-123', 'session_duration', 300);

      const loginMetrics = monitoring.getUserMetrics('user-123', 'login_count');
      const sessionMetrics = monitoring.getUserMetrics('user-123', 'session_duration');

      expect(loginMetrics).toHaveLength(1);
      expect(sessionMetrics).toHaveLength(1);
      expect(loginMetrics[0].value).toBe(5);
      expect(sessionMetrics[0].value).toBe(300);
    });

    it('filters user metrics by time range', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      // Add old metric manually
      monitoring['userMetrics'].push({
        userId: 'user-123',
        metricType: 'old_metric',
        value: 100,
        date: oldDate,
      });

      monitoring.recordUserMetric('user-123', 'new_metric', 200);

      const metrics = monitoring.getUserMetrics('user-123', undefined, 30);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].metricType).toBe('new_metric');
    });

    it('limits user metrics storage', () => {
      // Add 10001 user metrics
      for (let i = 0; i < 10001; i++) {
        monitoring.recordUserMetric(`user-${i}`, 'test_metric', i);
      }

      expect(monitoring['userMetrics']).toHaveLength(10000);
    });
  });

  describe('Custom Metrics', () => {
    it('records custom metrics', () => {
      monitoring.recordMetric('api_calls', 100, { endpoint: '/api/test' });

      const metrics = monitoring.getMetric('api_calls');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(100);
      expect(metrics[0].tags?.endpoint).toBe('/api/test');
    });

    it('filters custom metrics by time range', () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Add old metric manually
      monitoring['metrics'].set('test_metric', [{
        timestamp: oneHourAgo - 1000,
        value: 100,
      }]);

      monitoring.recordMetric('test_metric', 200);

      const metrics = monitoring.getMetric('test_metric', {
        start: oneHourAgo,
        end: now,
      });

      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(200);
    });

    it('limits custom metrics storage', () => {
      // Add 1001 metrics
      for (let i = 0; i < 1001; i++) {
        monitoring.recordMetric('test_metric', i);
      }

      expect(monitoring.getMetric('test_metric')).toHaveLength(1000);
    });
  });

  describe('Alert System', () => {
    it('creates alerts with unique IDs', () => {
      monitoring.createAlert('test_alert', 'medium', { test: 'data' });
      monitoring.createAlert('test_alert', 'medium', { test: 'data' });

      const alerts = monitoring.getAlerts();
      expect(alerts).toHaveLength(2);
      expect(alerts[0].id).not.toBe(alerts[1].id);
    });

    it('sorts alerts by timestamp descending', async () => {
      monitoring.createAlert('first_alert', 'low', {});
      
      // Wait a moment to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 2));
      
      monitoring.createAlert('second_alert', 'high', {});

      const alerts = monitoring.getAlerts();
      expect(alerts.length).toBe(2);
      expect(alerts[0].timestamp).toBeGreaterThan(alerts[1].timestamp);
    });

    it('filters alerts by severity', () => {
      monitoring.createAlert('low_alert', 'low', {});
      monitoring.createAlert('high_alert', 'high', {});

      const highAlerts = monitoring.getAlerts('high');
      const lowAlerts = monitoring.getAlerts('low');

      expect(highAlerts).toHaveLength(1);
      expect(lowAlerts).toHaveLength(1);
      expect(highAlerts[0].type).toBe('high_alert');
      expect(lowAlerts[0].type).toBe('low_alert');
    });

    it('acknowledges alerts', () => {
      monitoring.createAlert('test_alert', 'medium', {});
      const alerts = monitoring.getAlerts();
      const alertId = alerts[0].id;

      expect(alerts[0].acknowledged).toBe(false);

      monitoring.acknowledgeAlert(alertId);

      const updatedAlerts = monitoring.getAlerts();
      const acknowledgedAlert = updatedAlerts.find(a => a.id === alertId);
      expect(acknowledgedAlert?.acknowledged).toBe(true);
    });

    it('limits alert storage', () => {
      // Add 101 alerts
      for (let i = 0; i < 101; i++) {
        monitoring.createAlert(`alert_${i}`, 'low', {});
      }

      expect(monitoring.getAlerts()).toHaveLength(100);
    });
  });

  describe('External Alert Services', () => {
    it('sends Slack alerts when webhook URL is configured', async () => {
      process.env.SLACK_WEBHOOK_URL = mockEnv.SLACK_WEBHOOK_URL;
      (fetch as jest.Mock).mockResolvedValue({ ok: true });

      monitoring.createAlert('test_alert', 'critical', { error: 'Test error' });

      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async call

      expect(fetch).toHaveBeenCalledWith(
        mockEnv.SLACK_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('TEST_ALERT Alert'),
        })
      );
    });

    it('sends Discord alerts when webhook URL is configured', async () => {
      process.env.DISCORD_WEBHOOK_URL = mockEnv.DISCORD_WEBHOOK_URL;
      (fetch as jest.Mock).mockResolvedValue({ ok: true });

      monitoring.createAlert('test_alert', 'high', { error: 'Test error' });

      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async call

      expect(fetch).toHaveBeenCalledWith(
        mockEnv.DISCORD_WEBHOOK_URL,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('TEST_ALERT Alert'),
        })
      );
    });

    it('handles Slack webhook failures gracefully', async () => {
      process.env.SLACK_WEBHOOK_URL = mockEnv.SLACK_WEBHOOK_URL;
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      monitoring.createAlert('test_alert', 'critical', {});

      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async call

      expect(logger.error).toHaveBeenCalledWith('Failed to send Slack alert', expect.any(Error));
    });

    it('handles Discord webhook failures gracefully', async () => {
      process.env.DISCORD_WEBHOOK_URL = mockEnv.DISCORD_WEBHOOK_URL;
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      monitoring.createAlert('test_alert', 'critical', {});

      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async call

      expect(logger.error).toHaveBeenCalledWith('Failed to send Discord alert', expect.any(Error));
    });
  });

  describe('Health Status', () => {
    it('returns healthy status when all metrics are good', () => {
      monitoring.recordAPIPerformance('/api/test', 'GET', 100, 200);

      const health = monitoring.getHealthStatus();
      expect(health.status).toBe('healthy');
    });

    it('returns degraded status for slow response times', () => {
      monitoring.recordAPIPerformance('/api/slow', 'GET', 4000, 200);

      const health = monitoring.getHealthStatus();
      expect(health.status).toBe('degraded');
    });

    it('returns unhealthy status for high error rates', () => {
      // Add 9 successful requests
      for (let i = 0; i < 9; i++) {
        monitoring.recordAPIPerformance('/api/test', 'GET', 100, 200);
      }
      // Add 2 errors (20% error rate)
      for (let i = 0; i < 2; i++) {
        monitoring.recordAPIPerformance('/api/test', 'GET', 100, 500);
      }

      const health = monitoring.getHealthStatus();
      expect(health.status).toBe('unhealthy');
    });

    it('returns unhealthy status for critical alerts', () => {
      monitoring.createAlert('critical_issue', 'critical', {});

      const health = monitoring.getHealthStatus();
      expect(health.status).toBe('unhealthy');
    });

    it('includes performance metrics in health status', () => {
      monitoring.recordAPIPerformance('/api/test', 'GET', 100, 200);

      const health = monitoring.getHealthStatus();
      expect(health.performance.totalRequests).toBe(1);
      expect(health.performance.avgResponseTime).toBe(100);
    });

    it('includes security summary in health status', () => {
      monitoring.recordSecurityEvent('test_event', 'high', {});

      const health = monitoring.getHealthStatus();
      expect(health.security.totalEvents).toBe(1);
      expect(health.security.highSeverityEvents).toBe(1);
    });
  });

  describe('Dashboard Data', () => {
    it('provides dashboard data with performance metrics', () => {
      monitoring.recordAPIPerformance('/api/test', 'GET', 100, 200);

      const dashboard = monitoring.getDashboardData();
      expect(dashboard.performance.lastHour.totalRequests).toBeGreaterThanOrEqual(0);
      expect(dashboard.performance.lastDay.totalRequests).toBeGreaterThanOrEqual(0);
    });

    it('includes security events in dashboard data', () => {
      monitoring.recordSecurityEvent('test_event', 'medium', {});

      const dashboard = monitoring.getDashboardData();
      expect(dashboard.security.lastHour).toBeInstanceOf(Array);
      expect(dashboard.security.lastDay).toBeInstanceOf(Array);
    });

    it('includes alert information in dashboard data', () => {
      monitoring.createAlert('test_alert', 'high', {});

      const dashboard = monitoring.getDashboardData();
      expect(dashboard.alerts.unacknowledged).toHaveLength(1);
      expect(dashboard.alerts.recent).toHaveLength(1);
    });

    it('includes custom metrics in dashboard data', () => {
      monitoring.recordMetric('total_users', 100);
      monitoring.recordMetric('active_sessions', 50);

      const dashboard = monitoring.getDashboardData();
      expect(dashboard.metrics.totalUsers).toBe(100);
      expect(dashboard.metrics.activeSessions).toBe(50);
    });
  });

  describe('Data Cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('cleans up old performance data', () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;

      // Add old performance data manually
      monitoring['performanceData'].push({
        endpoint: '/api/old',
        method: 'GET',
        responseTime: 100,
        statusCode: 200,
        timestamp: eightDaysAgo,
      });

      monitoring.recordAPIPerformance('/api/new', 'GET', 100, 200);

      monitoring.cleanup();

      expect(monitoring['performanceData']).toHaveLength(1);
      expect(monitoring['performanceData'][0].endpoint).toBe('/api/new');
    });

    it('cleans up old security events', () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;

      // Add old security event manually
      monitoring['securityEvents'].push({
        event: 'old_event',
        severity: 'low',
        data: {},
        timestamp: eightDaysAgo,
      });

      monitoring.recordSecurityEvent('new_event', 'medium', {});

      monitoring.cleanup();

      expect(monitoring['securityEvents']).toHaveLength(1);
      expect(monitoring['securityEvents'][0].event).toBe('new_event');
    });

    it('cleans up old user metrics', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

      // Add old user metric manually
      monitoring['userMetrics'].push({
        userId: 'old-user',
        metricType: 'old_metric',
        value: 100,
        date: eightDaysAgo,
      });

      monitoring.recordUserMetric('new-user', 'new_metric', 200);

      monitoring.cleanup();

      expect(monitoring['userMetrics']).toHaveLength(1);
      expect(monitoring['userMetrics'][0].userId).toBe('new-user');
    });

    it('keeps alerts for 30 days', () => {
      const twentyDaysAgo = Date.now() - 20 * 24 * 60 * 60 * 1000;
      const fortyDaysAgo = Date.now() - 40 * 24 * 60 * 60 * 1000;

      // Add alerts manually
      monitoring['alerts'].push(
        {
          id: 'recent-alert',
          type: 'test',
          severity: 'low',
          data: {},
          timestamp: twentyDaysAgo,
          acknowledged: false,
        },
        {
          id: 'old-alert',
          type: 'test',
          severity: 'low',
          data: {},
          timestamp: fortyDaysAgo,
          acknowledged: false,
        }
      );

      monitoring.cleanup();

      expect(monitoring['alerts']).toHaveLength(1);
      expect(monitoring['alerts'][0].id).toBe('recent-alert');
    });
  });
});