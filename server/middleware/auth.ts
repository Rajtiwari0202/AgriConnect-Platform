import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { storage } from '../storage';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

// JWT authentication middleware
export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; iat: number; exp: number };
    
    // Get user from storage to ensure they still exist
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without authentication
  }

  try {
    if (!env.JWT_SECRET) {
      return next(); // Continue without authentication if JWT not configured
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await storage.getUser(decoded.userId);
    
    if (user) {
      req.userId = decoded.userId;
      req.user = user;
    }
  } catch (error) {
    // Ignore token errors in optional auth
  }

  next();
}

// Role-based authorization middleware
export function requireRole(roles: string | string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

// Subscription tier authorization
export function requireSubscription(minTier: 'basic' | 'pro' | 'enterprise') {
  const tierHierarchy = { basic: 1, pro: 2, enterprise: 3 };
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userTier = req.user.subscriptionTier || 'basic';
    const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[minTier];

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({ 
        message: `${minTier} subscription or higher required`,
        currentTier: userTier,
        requiredTier: minTier 
      });
    }

    // Check if subscription is active
    if (req.user.subscriptionStatus !== 'active') {
      return res.status(403).json({ 
        message: 'Active subscription required',
        subscriptionStatus: req.user.subscriptionStatus 
      });
    }

    next();
  };
}

// Generate JWT token
export function generateToken(userId: string): string {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}