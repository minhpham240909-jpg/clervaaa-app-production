import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';

// Mock the monitoring module
jest.mock('@/lib/monitoring', () => ({
  monitoring: {
    recordAPIPerformance: jest.fn(),
  },
}));

describe('/api/health', () => {
  it('returns 200 status with health information', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('environment');
  });

  it('includes correct headers', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate');
  });

  it('returns valid JSON structure', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    
    const data = await response.json();
    
    // Check that all required fields are present and have correct types
    expect(typeof data.status).toBe('string');
    expect(typeof data.timestamp).toBe('string');
    expect(typeof data.uptime).toBe('number');
    expect(typeof data.version).toBe('string');
    expect(typeof data.environment).toBe('string');
    
    // Check that status is one of the expected values
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
    
    // Check that timestamp is a valid ISO string
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    
    // Check that uptime is positive
    expect(data.uptime).toBeGreaterThan(0);
  });

  it('handles different request methods gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'POST',
    });
    
    // Should still work even with POST method
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
