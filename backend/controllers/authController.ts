import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { USER_ROLES, UserRole } from '../models/User';

const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id: userId, role }, secret, { expiresIn: '24h' });
};

const ROLE_MAPPING: Record<string, UserRole> = {
  admin: 'Admin',
  administrator: 'Admin',
  doctor: 'Doctor',
  patient: 'Patient',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  pharmacist: 'Pharmacist',
  lab_technician: 'Lab Technician',
  'lab technician': 'Lab Technician',
  accountant: 'Accountant',
};

const normalizeEmail = (email: unknown): string =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const normalizeRole = (role: unknown): UserRole | null => {
  if (typeof role !== 'string') return null;
  return ROLE_MAPPING[role.trim().toLowerCase()] ?? null;
};

// REGISTER: all permitted non-admin roles register with pending status.
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (
      typeof fullName !== 'string' ||
      !fullName.trim() ||
      typeof password !== 'string' ||
      !password ||
      !email ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password and role.',
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const adminEmail = normalizeEmail(
      process.env.ADMIN_EMAIL || 'admin@carepoint.com'
    );

    if (normalizedEmail === adminEmail) {
      return res.status(403).json({
        success: false,
        message: 'This email is reserved for the system administrator.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const normalizedRole = normalizeRole(role);

    if (!normalizedRole || normalizedRole === 'Admin' || !USER_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selection. Admin accounts cannot self-register.',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: normalizedRole,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is awaiting Admin approval.',
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

// LOGIN: Admin and all other users are authenticated against MongoDB.
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // If the login form sends a role, ensure it matches the MongoDB role.
    if (role !== undefined) {
      const requestedRole = normalizeRole(role);

      if (!requestedRole || requestedRole !== user.role) {
        return res.status(403).json({
          success: false,
          message: 'The selected role does not match this account.',
        });
      }
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending Admin approval. Please wait for activation.',
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your registration has been rejected by Admin.',
      });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not approved for login.',
      });
    }

    const token = generateToken(user._id.toString(), user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

// GET PENDING USERS (Admin)
export const getPendingUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, users });
  } catch (error: unknown) {
    console.error('Get pending users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching pending requests.',
    });
  }
};

// APPROVE OR REJECT USER (Admin)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.',
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected.',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Account successfully ${status}.`,
      user,
    });
  } catch (error: unknown) {
    console.error('Update user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user status.',
    });
  }
};
