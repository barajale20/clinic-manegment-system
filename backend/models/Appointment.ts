import mongoose, { Schema, Document } from 'mongoose';

export type AppointmentType = 'General Checkup' | 'Consultation' | 'Follow-up';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface IAppointment extends Document {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientGender?: string;
  patientAge?: number;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export const AppointmentSchema = new Schema<IAppointment>(
  {
    id: { type: String, required: true, unique: true },
    appointmentId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: '' },
    patientGender: { type: String },
    patientAge: { type: Number },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorSpecialization: { type: String, default: 'General Practice' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: {
      type: String,
      enum: ['General Checkup', 'Consultation', 'Follow-up'],
      default: 'General Checkup',
    },
    reason: { type: String, default: 'Routine clinical checkup' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Confirmed',
    },
    notes: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const AppointmentModel = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
