import { describe, it, expect } from 'vitest';

describe('Auth middleware', () => {
  it('middleware module exports correctly', async () => {
    const mod = await import('../auth.js');
    expect(mod.verifyTokenMiddleware).toBeDefined();
    expect(typeof mod.verifyTokenMiddleware).toBe('function');
  });

  it('verifyTokenMiddleware is a valid Express middleware', async () => {
    const { verifyTokenMiddleware } = await import('../auth.js');
    expect(verifyTokenMiddleware.length).toBe(3); // req, res, next
  });
});