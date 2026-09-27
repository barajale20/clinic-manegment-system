import { Request, Response } from 'express';
import { AppointmentCollection, PatientCollection, DoctorCollection } from '../config/store.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

export const getAppointments = async (req: AuthRequest, res: Response) => {
  const { doctorId, date, status, patientId } = req.query;
  let list = await AppointmentCollection.find();

  // If authenticated user is a doctor, restrict to their appointments unless admin
  const user = req.user;
  if (user && user.role === 'doctor') {
    list = list.filter((a) => a.doctorId === user.id);
  } else if (doctorId) {
    list = list.filter((a) => a.doctorId === doctorId);
  }

  if (patientId) {
    list = list.filter((a) => a.patientId === patientId);
  }

  if (date) {
    list = list.filter((a) => a.date === date);
  }

  if (status && status !== 'all') {
    list = list.filter((a) => a.status === status);
  }

  res.json(list);
};

export const createAppointment = async (req: Request, res: Response) => {
  const { patientId, doctorId, date, time, type, reason } = req.body;
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: 'Patient, Doctor, Date, and Time are required.' });
  }

  const patient = await PatientCollection.findById(patientId);
  const doctor = await DoctorCollection.findById(doctorId);

  const newAppointment = await AppointmentCollection.create({
    id: `apt-${Date.now()}`,
    appointmentId: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId,
    patientName: patient ? patient.fullName : 'Registered Patient',
    patientPhone: patient ? patient.phone : '+256 700 000000',
    patientGender: patient?.gender,
    patientAge: patient?.age,
    doctorId,
    doctorName: doctor ? doctor.fullName : 'Consulting Doctor',
    doctorSpecialization: doctor ? doctor.specialization : 'General Practice',
    date,
    time,
    type: type || 'General Checkup',
    reason: reason || 'Routine clinical appointment',
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(newAppointment);
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: ${status}` });
  }

  const updated = await AppointmentCollection.findByIdAndUpdate(id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  res.json(updated);
};

export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await AppointmentCollection.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.json({ success: true, message: 'Appointment cancelled and removed.' });
};
