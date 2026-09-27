import mongoose, { Schema, Document } from 'mongoose';
import { IPrescription, PrescriptionSchema } from './Prescription.ts';

export interface IMedicalRecord extends Document {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  status: 'Active' | 'Completed';
  prescription?: IPrescription;
  appointmentId?: string;
  createdAt: string;
}

export const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    id: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number },
    patientGender: { type: String },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    visitDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    symptoms: { type: String, default: '' },
    diagnosis: { type: String, required: true },
    treatment: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Completed' },
    prescription: { type: PrescriptionSchema },
    appointmentId: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const MedicalRecordModel =
  mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
