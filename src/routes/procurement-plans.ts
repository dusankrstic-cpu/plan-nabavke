import { Router } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { procurement_plans, items } from '../db/schema.js';
import { verifyToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const createProcurementPlanSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.string().min(1).max(50).default('draft'),
  items: z.array(z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive().optional(),
    total_price: z.number().positive().optional(),
  })).optional(),
});

const updateProcurementPlanSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.string().min(1).max(50).optional(),
  items: z.array(z.object({
    id: z.number().int().optional(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive().optional(),
    total_price: z.number().positive().optional(),
  })).optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0, 'Page must be positive').default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').default('10'),
});

// GET /api/procurement-plans - List with pagination
router.get('/', async (req, res) => {
  try {
    const queryResult = paginationSchema.safeParse(req.query);
    
    if (!queryResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: queryResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { page, limit } = queryResult.data;
    const offset = (page - 1) * limit;

    const plans = await db
      .select()
      .from(procurement_plans)
      .orderBy(desc(procurement_plans.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: procurement_plans.id })
      .from(procurement_plans);

    return res.json({
      data: plans,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/procurement-plans/:id - Single plan with items
router.get('/:id', async (req, res) => {
  try {
    const planId = parseInt(req.params.id, 10);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const plan = await db
      .select()
      .from(procurement_plans)
      .where(eq(procurement_plans.id, planId))
      .limit(1);

    if (plan.length === 0) {
      return res.status(404).json({ error: 'Procurement plan not found' });
    }

    const planItems = await db
      .select()
      .from(items)
      .where(eq(items.procurement_plan_id, planId));

    return res.json({
      ...plan[0],
      items: planItems,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/procurement-plans - Create (requires auth)
router.post('/', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const body = createProcurementPlanSchema.parse(req.body);
    
    const [newPlan] = await db
      .insert(procurement_plans)
      .values({
        title: body.title,
        description: body.description,
        status: body.status,
        user_id: req.user!.userId,
      })
      .returning();

    if (body.items && body.items.length > 0) {
      const itemsToInsert = body.items.map(item => ({
        procurement_plan_id: newPlan.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price?.toString(),
        total_price: item.total_price?.toString(),
      }));

      await db.insert(items).values(itemsToInsert);
    }

    const planWithItems = await db
      .select()
      .from(procurement_plans)
      .where(eq(procurement_plans.id, newPlan.id))
      .limit(1);

    const planItems = await db
      .select()
      .from(items)
      .where(eq(items.procurement_plan_id, newPlan.id));

    return res.status(201).json({
      ...planWithItems[0],
      items: planItems,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/procurement-plans/:id - Update (requires auth, only owner)
router.put('/:id', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const planId = parseInt(req.params.id, 10);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const body = updateProcurementPlanSchema.parse(req.body);

    const existingPlan = await db
      .select()
      .from(procurement_plans)
      .where(eq(procurement_plans.id, planId))
      .limit(1);

    if (existingPlan.length === 0) {
      return res.status(404).json({ error: 'Procurement plan not found' });
    }

    if (existingPlan[0].user_id !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    updateData.updated_at = new Date();

    await db
      .update(procurement_plans)
      .set(updateData)
      .where(eq(procurement_plans.id, planId));

    if (body.items) {
      // Delete existing items
      await db.delete(items).where(eq(items.procurement_plan_id, planId));

      // Insert new items
      if (body.items.length > 0) {
        const itemsToInsert = body.items.map(item => ({
          procurement_plan_id: planId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price?.toString(),
          total_price: item.total_price?.toString(),
        }));

        await db.insert(items).values(itemsToInsert);
      }
    }

    const updatedPlan = await db
      .select()
      .from(procurement_plans)
      .where(eq(procurement_plans.id, planId))
      .limit(1);

    const planItems = await db
      .select()
      .from(items)
      .where(eq(items.procurement_plan_id, planId));

    return res.json({
      ...updatedPlan[0],
      items: planItems,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/procurement-plans/:id - Delete (requires auth, only owner)
router.delete('/:id', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    const planId = parseInt(req.params.id, 10);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const existingPlan = await db
      .select()
      .from(procurement_plans)
      .where(eq(procurement_plans.id, planId))
      .limit(1);

    if (existingPlan.length === 0) {
      return res.status(404).json({ error: 'Procurement plan not found' });
    }

    if (existingPlan[0].user_id !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete items first (foreign key constraint)
    await db.delete(items).where(eq(items.procurement_plan_id, planId));

    // Delete the plan
    await db.delete(procurement_plans).where(eq(procurement_plans.id, planId));

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;