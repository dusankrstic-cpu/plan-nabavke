import { pgTable, uuid, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  password_hash: text('password_hash').notNull(),
  role: text('role').default('user').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const procurement_plans = pgTable('procurement_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  budget: numeric('budget'),
  status: text('status').default('draft').notNull(),
  created_by: uuid('created_by').references(() => users.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price').notNull(),
  procurement_plan_id: uuid('procurement_plan_id').references(() => procurement_plans.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});