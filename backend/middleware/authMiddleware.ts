import { Request, Response, NextFunction } from 'express';
import { UserCollection } from '../config/store.ts';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor';
  avatar?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateUser = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    // Handle demo JWT tokens formatted as jwt-carepoint-[userId]-[timestamp] or standard string
    let userId = '';
    if (token.startsWith('jwt-carepoint-')) {
      const parts = token.split('-');
      // format: jwt-carepoint-[id-part1]-[id-part2]-...-[timestamp]
      // or check all users
      const allUsers = await UserCollection.find();
      const matched = allUsers.find((u) => token.includes(u.id));
      if (matched) {
        req.user = matched;
        return next();
      }
    }

    // Default lookup by ID or token match
    const user = await UserCollection.findOne({ id: userId });
    if (user) {
      req.user = user;
    }
  } catch (error) {
    console.error('Error authenticating user token:', error);
  }

  next();
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'You must provide a valid authorization token to access this resource.',
    });
  }
  next();
};

export const requireRole = (...allowedRoles: Array<'admin' | 'doctor'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      // Fallback: check query or header for demo simulation if header missing
      const fallbackRole = (req.headers['x-user-role'] as 'admin' | 'doctor') || (req.query.role as 'admin' | 'doctor');
      if (fallbackRole && allowedRoles.includes(fallbackRole)) {
        return next();
      }

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token missing or invalid.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access Denied: RBAC Authorization Failed',
        message: `Your current role '${req.user.role}' is not authorized to access this resource. Required role: ${allowedRoles.join(' or ')}.`,
        userRole: req.user.role,
        allowedRoles,
      });
    }

    next();
  };
};
