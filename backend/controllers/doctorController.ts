import { Request, Response } from 'express';
import { DoctorCollection, UserCollection } from '../config/store.ts';

export const getDoctors = async (req: Request, res: Response) => {
  const { specialization, status } = req.query;
  let list = await DoctorCollection.find();

  if (status && status !== 'all') {
    list = list.filter((d) => d.status === status);
  }

  if (specialization && specialization !== 'all') {
    list = list.filter((d) => d.specialization === specialization);
  }

  res.json(list);
};

export const getDoctorById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const doctor = await DoctorCollection.findById(id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  res.json(doctor);
};

export const createDoctor = async (req: Request, res: Response) => {
  const { fullName, email, phone, specialization, licenseNumber, gender, dob, address, schedule } = req.body;

  if (!fullName || !email || !specialization) {
    return res.status(400).json({ error: 'Full name, email, and specialization are required.' });
  }

  const generatedId = `doc-${Date.now()}`;
  const generatedLicense = licenseNumber || `MD-UG-${Math.floor(10000 + Math.random() * 90000)}`;

  const newDoctor = await DoctorCollection.create({
    id: generatedId,
    fullName,
    email,
    phone: phone || '',
    specialization,
    licenseNumber: generatedLicense,
    gender: gender || 'Female',
    dob: dob || '1988-01-01',
    address: address || 'Kampala, Uganda',
    schedule: schedule || {
      Monday: '09:00 AM – 04:00 PM',
      Tuesday: '09:00 AM – 04:00 PM',
      Wednesday: '09:00 AM – 04:00 PM',
      Thursday: '09:00 AM – 04:00 PM',
      Friday: '09:00 AM – 02:00 PM',
    },
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1594824813576-928df7764d8a?auto=format&fit=crop&q=80&w=256',
    appointmentsCount: 0,
    completedVisitsCount: 0,
    upcomingCount: 0,
  });

  // Also add to UserCollection with doctor role
  await UserCollection.create({
    id: generatedId,
    name: fullName,
    email,
    role: 'doctor',
    avatar: newDoctor.avatar,
    phone: newDoctor.phone,
    specialization: newDoctor.specialization,
    licenseNumber: newDoctor.licenseNumber,
    password: 'password123',
  });

  res.status(201).json(newDoctor);
};

export const updateDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await DoctorCollection.findByIdAndUpdate(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  // Update in User collection as well
  await UserCollection.findByIdAndUpdate(id, {
    name: updated.fullName,
    email: updated.email,
    phone: updated.phone,
    specialization: updated.specialization,
  });

  res.json(updated);
};

export const deleteDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await DoctorCollection.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  // Also remove from user collection
  await UserCollection.findByIdAndDelete(id);

  res.json({ success: true, message: 'Doctor deleted successfully' });
};
