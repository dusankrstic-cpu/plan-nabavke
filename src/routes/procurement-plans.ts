import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { procurementPlans } from '../db/schema.js';
import { verifyTokenMiddleware } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();

const createPlanSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
});

const updatePlanSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
});

// Get all procurement plans for authenticated user
router.get('/procurement-plans', verifyTokenMiddleware, async (req, res) => {
  try {
    const plans = await db
      .select()
      .from(procurementPlans)
      .where(eq(procurementPlans.userId, req.user!.userId));
    
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single procurement plan
router.get('/procurement-plans/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const [plan] = await db
      .select()
      .from(procurementPlans)
      .where(eq(procurementPlans.id, planId));

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (plan.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new procurement plan
router.post('/procurement-plans', verifyTokenMiddleware, async (req, res) => {
  try {
    const body = createPlanSchema.parse(req.body);
    
    const [newPlan] = await db
      .insert(procurementPlans)
      .values({
        title: body.title,
        description: body.description,
        budget: body.budget,
        status: body.status || 'draft',
        userId: req.user!.userId,
      })
      .returning();

    res.status(201).json(newPlan);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update procurement plan
router.put('/procurement-plans/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const body = updatePlanSchema.parse(req.body);

    // Check if plan exists and belongs to user
    const [existingPlan] = await db
      .select()
      .from(procurementPlans)
      .where(eq(procurementPlans.id, planId));

    if (!existingPlan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (existingPlan.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [updatedPlan] = await db
      .update(procurementPlans)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(procurementPlans.id, planId))
      .returning();

    res.json(updatedPlan);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete procurement plan
router.delete('/procurement-plans/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Check if plan exists and belongs to user
    const [existingPlan] = await db
      .select()
      .from(procurementPlans)
      .where(eq(procurementPlans.id, planId));

    if (!existingPlan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (existingPlan.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db
      .delete(procurementPlans)
      .where(eq(procurementPlans.id, planId));

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;