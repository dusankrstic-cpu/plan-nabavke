import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users } from '../db/schema.js';
import { generateToken } from '../utils/jwt.js';
import { verifyTokenMiddleware } from '../middleware/auth.js';
import healthRoutes from '../routes/health.js';
import procurementRoutes from '../routes/procurement-plans.js';
import type { RegisterRequest, LoginRequest } from '../types/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health routes
app.use('/', healthRoutes);

// Auth schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(255),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body) as RegisterRequest;
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email,
        password: hashedPassword,
        name: body.name,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    res.status(201).json({
      token,
      user: newUser,
    });
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body) as LoginRequest;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(body.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
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

// Protected routes
app.use('/api', procurementRoutes);

// Test protected endpoint
app.get('/api/profile', verifyTokenMiddleware, async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;