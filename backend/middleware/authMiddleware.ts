
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    status?: string;
    email?: string;
    fullName?: string;
  };
}

interface TokenPayload extends jwt.JwtPayload {
  id: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'Not authorized, no valid token provided.',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      message: 'Token is missing.',
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        message: 'Server authentication configuration error.',
      });
      return;
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      typeof decoded.id !== 'string' ||
      !decoded.id
    ) {
      res.status(401).json({
        message: 'Invalid token payload.',
      });
      return;
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.status !== 'approved') {
      res.status(401).json({
        message: 'Account not found or not approved.',
      });
      return;
    }

    req.user = {
      id: String(user._id),
      role: String(user.role),
      status: String(user.status),
      email: user.email,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Not authorized, token invalid or expired.',
    });
  }
};

// Hubi in user-ku soo galay oo la xaqiijiyey.
export const authenticateUser = protect;

// Hubi role-ka user-ka.
export const requireRole = (role: string) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        message: 'Please log in first.',
      });
      return;
    }

    const userRole = String(req.user.role ?? '').toLowerCase();
    const requiredRole = role.toLowerCase();

    if (userRole !== requiredRole) {
      res.status(403).json({
        message: 'Access denied: insufficient permissions.',
      });
      return;
    }

    next();
  };
};

export const adminOnly = requireRole('admin');
