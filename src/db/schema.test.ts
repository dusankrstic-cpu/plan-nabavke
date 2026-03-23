import { describe, it, expect } from 'vitest';

describe('Database Schema', () => {
  it('exports all required tables', async () => {
    const schema = await import('./schema.js');
    
    expect(schema.users).toBeDefined();
    expect(schema.procurement_plans).toBeDefined();
    expect(schema.items).toBeDefined();
  });

  it('users table has correct structure', async () => {
    const { users } = await import('./schema.js');
    
    expect(users).toBeDefined();
    expect(typeof users).toBe('object');
    
    // Verify table has the expected columns
    const columns = Object.keys(users);
    expect(columns).toContain('id');
    expect(columns).toContain('email');
    expect(columns).toContain('password_hash');
    expect(columns).toContain('role');
    expect(columns).toContain('created_at');
    expect(columns).toContain('updated_at');
  });

  it('procurement_plans table has correct structure', async () => {
    const { procurement_plans } = await import('./schema.js');
    
    expect(procurement_plans).toBeDefined();
    expect(typeof procurement_plans).toBe('object');
    
    // Verify table has the expected columns
    const columns = Object.keys(procurement_plans);
    expect(columns).toContain('id');
    expect(columns).toContain('title');
    expect(columns).toContain('description');
    expect(columns).toContain('budget');
    expect(columns).toContain('status');
    expect(columns).toContain('created_by');
    expect(columns).toContain('created_at');
    expect(columns).toContain('updated_at');
  });

  it('items table has correct structure', async () => {
    const { items } = await import('./schema.js');
    
    expect(items).toBeDefined();
    expect(typeof items).toBe('object');
    
    // Verify table has the expected columns
    const columns = Object.keys(items);
    expect(columns).toContain('id');
    expect(columns).toContain('name');
    expect(columns).toContain('description');
    expect(columns).toContain('quantity');
    expect(columns).toContain('unit_price');
    expect(columns).toContain('procurement_plan_id');
    expect(columns).toContain('created_at');
  });

  it('schema module can be imported without errors', async () => {
    // Verify the module can be imported without errors
    const mod = await import('./schema.js');
    expect(mod).toBeDefined();
  });
});