import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  address: string;
  schedule: Record<string, string>;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar?: string;
  appointmentsCount: number;
  completedVisitsCount: number;
  upcomingCount: number;
}

export const DoctorSchema = new Schema<IDoctor>(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Female' },
    dob: { type: String, default: '1988-01-01' },
    address: { type: String, default: 'Kampala, Uganda' },
    schedule: {
      type: Map,
      of: String,
      default: {
        Monday: '09:00 AM – 04:00 PM',
        Tuesday: '09:00 AM – 04:00 PM',
        Wednesday: '09:00 AM – 04:00 PM',
        Thursday: '09:00 AM – 04:00 PM',
        Friday: '09:00 AM – 02:00 PM',
      },
    },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
    avatar: { type: String },
    appointmentsCount: { type: Number, default: 0 },
    completedVisitsCount: { type: Number, default: 0 },
    upcomingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DoctorModel = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
