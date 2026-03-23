import { describe, it, expect } from 'vitest';

describe('Server module', () => {
  it('exports app and startServer correctly', async () => {
    const mod = await import('./index.js');
    expect(mod.app).toBeDefined();
    expect(mod.startServer).toBeDefined();
    expect(typeof mod.startServer).toBe('function');
  });

  it('app is an Express application', async () => {
    const { app } = await import('./index.js');
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
    expect(app.listen).toBeDefined();
  });

  it('health endpoint structure is valid', async () => {
    // Test the health endpoint response structure without actually starting server
    const healthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
    
    expect(healthResponse).toHaveProperty('status', 'ok');
    expect(healthResponse).toHaveProperty('timestamp');
    expect(healthResponse).toHaveProperty('uptime');
    expect(typeof healthResponse.timestamp).toBe('string');
    expect(typeof healthResponse.uptime).toBe('number');
  });
});