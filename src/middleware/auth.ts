import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { User, AuthenticatedRequest } from '../types/auth.js';

export function generateToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  try {
    return jwt.sign({ userId, role }, secret, { expiresIn: '24h' });
  } catch (error) {
    throw new Error('Failed to generate JWT token');
  }
}

export async function verifyToken(
  request: FastifyRequest & AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authorization header is required'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authorization header must start with Bearer'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Token is required'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'JWT_SECRET environment variable is required'
      });
    }

    try {
      const decoded = jwt.verify(token, secret) as { userId: string; role: string };
      request.user = {
        id: decoded.userId,
        role: decoded.role
      };
    } catch (jwtError) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Token verification failed'
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return async function(
    request: FastifyRequest & AuthenticatedRequest,
    reply: FastifyReply
  ) {
    try {
      if (!request.user) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }

      if (!allowedRoles.includes(request.user.role)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient role permissions'
        });
      }
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Role verification failed'
      });
    }
  };
}