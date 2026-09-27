import { Request, Response } from 'express';
import { PrescriptionCollection, PatientCollection, DoctorCollection } from '../config/store.ts';

export const getPrescriptions = async (req: Request, res: Response) => {
  const { patientId, doctorId } = req.query;
  let list = await PrescriptionCollection.find();

  if (patientId) {
    list = list.filter((p) => p.patientId === patientId);
  }

  if (doctorId) {
    list = list.filter((p) => p.doctorId === doctorId);
  }

  res.json(list);
};

export const createPrescription = async (req: Request, res: Response) => {
  const { patientId, doctorId, date, medicines, instructions } = req.body;
  if (!patientId || !doctorId || !medicines || medicines.length === 0) {
    return res.status(400).json({ error: 'Patient, Doctor, and at least one medication are required.' });
  }

  const patient = await PatientCollection.findById(patientId);
  const doctor = await DoctorCollection.findById(doctorId);
  const allRx = await PrescriptionCollection.find();

  const newPrescription = await PrescriptionCollection.create({
    id: `rx-${Date.now()}`,
    prescriptionNumber: `RX-2026-0${80 + allRx.length + 1}`,
    patientId,
    patientName: patient ? patient.fullName : 'Patient',
    doctorId,
    doctorName: doctor ? doctor.fullName : 'Doctor',
    date: date || new Date().toISOString().split('T')[0],
    medicines: medicines || [],
    instructions: instructions || 'Take medications after meals as directed.',
    status: 'Active',
  });

  res.status(201).json(newPrescription);
};

export const updatePrescriptionStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await PrescriptionCollection.findByIdAndUpdate(id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  res.json(updated);
};
