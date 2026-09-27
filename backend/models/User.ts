import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'doctor';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: 'password123' },
    role: { type: String, enum: ['admin', 'doctor'], required: true },
    avatar: { type: String },
    phone: { type: String },
    specialization: { type: String },
    licenseNumber: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
