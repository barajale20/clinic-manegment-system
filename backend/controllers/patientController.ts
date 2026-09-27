import { Request, Response } from 'express';
import { PatientCollection } from '../config/store.ts';

export const getPatients = async (req: Request, res: Response) => {
  const { search, status } = req.query;
  let list = await PatientCollection.find();

  if (status && status !== 'all') {
    list = list.filter((p) => p.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }

  res.json(list);
};

export const getPatientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = await PatientCollection.findById(id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
};

export const createPatient = async (req: Request, res: Response) => {
  const {
    fullName,
    dob,
    gender,
    phone,
    email,
    address,
    emergencyContact,
    bloodGroup,
    allergies,
    notes,
  } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'Full name and phone number are required.' });
  }

  let age = 30;
  if (dob) {
    const birthYear = new Date(dob).getFullYear();
    if (!isNaN(birthYear)) {
      age = new Date().getFullYear() - birthYear;
    }
  }

  const allPatients = await PatientCollection.find();
  const nextNumber = 125 + allPatients.length;

  const newPatient = await PatientCollection.create({
    id: `pat-${Date.now()}`,
    patientId: `PT-00${nextNumber}`,
    fullName,
    dob: dob || '1995-01-01',
    age,
    gender: gender || 'Male',
    phone,
    email: email || '',
    address: address || '',
    emergencyContact: emergencyContact || '',
    bloodGroup: bloodGroup || 'O+',
    allergies: allergies || 'None reported',
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    notes: notes || '',
  });

  res.status(201).json(newPatient);
};

export const updatePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await PatientCollection.findByIdAndUpdate(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(updated);
};

export const deletePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await PatientCollection.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json({ success: true, message: 'Patient removed successfully' });
};
