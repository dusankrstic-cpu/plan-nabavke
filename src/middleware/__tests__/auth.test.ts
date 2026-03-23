import { describe, it, expect } from 'vitest';

describe('Auth middleware', () => {
  it('auth module exports correctly', async () => {
    const mod = await import('../auth.js');
    expect(mod).toBeDefined();
    expect(typeof mod.generateToken).toBe('function');
    expect(typeof mod.verifyToken).toBe('function');
    expect(typeof mod.requireRole).toBe('function');
  });

  it('generateToken function is exported', async () => {
    const { generateToken } = await import('../auth.js');
    expect(typeof generateToken).toBe('function');
  });

  it('verifyToken function is exported', async () => {
    const { verifyToken } = await import('../auth.js');
    expect(typeof verifyToken).toBe('function');
  });

  it('requireRole function is exported', async () => {
    const { requireRole } = await import('../auth.js');
    expect(typeof requireRole).toBe('function');
  });

  it('requireRole returns a function', async () => {
    const { requireRole } = await import('../auth.js');
    const middleware = requireRole(['admin']);
    expect(typeof middleware).toBe('function');
  });
});