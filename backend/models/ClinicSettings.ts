import mongoose, { Schema, Document } from 'mongoose';

export interface IClinicSettings extends Document {
  clinicName: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  defaultAppointmentDuration: number;
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  appointmentReminders: boolean;
  newAppointmentNotifications: boolean;
  systemNotifications: boolean;
  language: string;
  dateFormat: string;
  theme: string;
}

export const ClinicSettingsSchema = new Schema<IClinicSettings>(
  {
    clinicName: { type: String, default: 'CarePoint Clinic' },
    phone: { type: String, default: '+256 700 123 456' },
    email: { type: String, default: 'info@carepointclinic.com' },
    address: { type: String, default: 'Plot 14, Acacia Avenue, Kololo, Kampala, Uganda' },
    description: { type: String, default: 'CarePoint Clinic is a premier outpatient healthcare center dedicated to patient-centered clinical excellence.' },
    defaultAppointmentDuration: { type: Number, default: 30 },
    workingDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    openingTime: { type: String, default: '08:00 AM' },
    closingTime: { type: String, default: '06:00 PM' },
    appointmentReminders: { type: Boolean, default: true },
    newAppointmentNotifications: { type: Boolean, default: true },
    systemNotifications: { type: Boolean, default: true },
    language: { type: String, default: 'English (US)' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    theme: { type: String, default: 'System Default' },
  },
  { timestamps: true }
);

export const ClinicSettingsModel =
  mongoose.models.ClinicSettings || mongoose.model<IClinicSettings>('ClinicSettings', ClinicSettingsSchema);
