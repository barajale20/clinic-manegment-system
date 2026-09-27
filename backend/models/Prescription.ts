import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface IPrescription extends Document {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medicines: IPrescriptionItem[];
  instructions: string;
  status: 'Active' | 'Completed';
  recordId?: string;
}

const PrescriptionItemSchema = new Schema<IPrescriptionItem>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, default: 'Take as directed' },
  },
  { _id: false }
);

export const PrescriptionSchema = new Schema<IPrescription>(
  {
    id: { type: String, required: true, unique: true },
    prescriptionNumber: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    medicines: [PrescriptionItemSchema],
    instructions: { type: String, default: 'Take medications as directed.' },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    recordId: { type: String },
  },
  { timestamps: true }
);

export const PrescriptionModel =
  mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
