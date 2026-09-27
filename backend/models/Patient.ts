import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  id: string;
  patientId: string;
  fullName: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  allergies: string;
  registrationDate: string;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export const PatientSchema = new Schema<IPatient>(
  {
    id: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dob: { type: String, default: '1995-01-01' },
    age: { type: Number, default: 30 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    bloodGroup: { type: String, default: 'O+' },
    allergies: { type: String, default: 'None reported' },
    registrationDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const PatientModel = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
