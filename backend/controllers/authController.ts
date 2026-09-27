import { Request, Response } from 'express';
import { UserCollection } from '../config/store.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserCollection.findOne((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  // Allow password123 or length >= 6 for demo
  if (password !== 'password123' && password.length < 6) {
    return res.status(401).json({ error: 'Invalid password. Must be at least 6 characters.' });
  }

  const token = `jwt-carepoint-${user.id}-${Date.now()}`;

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
    },
  });
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.json({ user: req.user });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  return res.json({ message: `Password reset instructions sent to ${email}` });
};
