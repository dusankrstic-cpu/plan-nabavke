import { describe, it, expect } from 'vitest';

describe('Server index', () => {
  it('server module exports correctly', async () => {
    const mod = await import('../index.js');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('object');
  });

  it('server app has listen method', async () => {
    const { default: app } = await import('../index.js');
    expect(typeof app.listen).toBe('function');
  });
});