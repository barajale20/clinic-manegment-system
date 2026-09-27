export type UserRole = 'admin' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface Patient {
  id: string;
  patientId: string; // e.g. PT-00124
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

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  address: string;
  schedule: Record<string, string>; // e.g. { Monday: "09:00 AM – 04:00 PM", ... }
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar?: string;
  appointmentsCount: number;
  completedVisitsCount: number;
  upcomingCount: number;
}

export type AppointmentType = 'General Checkup' | 'Consultation' | 'Follow-up';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  appointmentId: string; // e.g. APT-8921
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientGender?: string;
  patientAge?: number;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 09:00 AM
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string; // e.g. 500mg
  frequency: string; // e.g. 3 times daily
  duration: string; // e.g. 5 days
  instructions: string; // e.g. After meals
}

export interface Prescription {
  id: string;
  prescriptionNumber: string; // e.g. RX-2026-081
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medicines: PrescriptionItem[];
  instructions: string;
  status: 'Active' | 'Completed';
  recordId?: string;
}

export interface MedicalRecord {
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
  prescription?: Prescription;
  appointmentId?: string;
  createdAt: string;
}

export interface ClinicSettings {
  clinicName: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  defaultAppointmentDuration: number; // e.g. 30
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
