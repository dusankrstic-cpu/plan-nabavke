import { pgTable, serial, varchar, text, timestamp, integer, decimal, uuid } from 'drizzle-orm/pg-core';

export const procurement_plans = pgTable('procurement_plans', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  procurement_plan_id: integer('procurement_plan_id').references(() => procurement_plans.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  quantity: integer('quantity').notNull(),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }),
  total_price: decimal('total_price', { precision: 10, scale: 2 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});