import { Request, Response } from 'express';
import {
  RecordCollection,
  PatientCollection,
  DoctorCollection,
  PrescriptionCollection,
  AppointmentCollection,
} from '../config/store.ts';

export const getRecords = async (req: Request, res: Response) => {
  const { patientId, doctorId } = req.query;
  let list = await RecordCollection.find();

  if (patientId) {
    list = list.filter((r) => r.patientId === patientId);
  }

  if (doctorId) {
    list = list.filter((r) => r.doctorId === doctorId);
  }

  res.json(list);
};

export const getRecordById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await RecordCollection.findById(id);
  if (!record) {
    return res.status(404).json({ error: 'Medical record not found' });
  }
  res.json(record);
};

export const createRecord = async (req: Request, res: Response) => {
  const {
    patientId,
    doctorId,
    visitDate,
    symptoms,
    diagnosis,
    treatment,
    notes,
    prescription,
    appointmentId,
  } = req.body;

  if (!patientId || !doctorId || !diagnosis) {
    return res.status(400).json({ error: 'Patient, Doctor, and Diagnosis are required.' });
  }

  const patient = await PatientCollection.findById(patientId);
  const doctor = await DoctorCollection.findById(doctorId);

  let createdPrescription = undefined;
  if (prescription && prescription.medicines && prescription.medicines.length > 0) {
    const allRx = await PrescriptionCollection.find();
    createdPrescription = await PrescriptionCollection.create({
      id: `rx-${Date.now()}`,
      prescriptionNumber: `RX-2026-0${80 + allRx.length + 1}`,
      patientId,
      patientName: patient ? patient.fullName : 'Patient',
      doctorId,
      doctorName: doctor ? doctor.fullName : 'Doctor',
      date: visitDate || new Date().toISOString().split('T')[0],
      medicines: prescription.medicines,
      instructions: prescription.instructions || 'Take as instructed.',
      status: 'Active',
      recordId: `rec-${Date.now()}`,
    });
  }

  const newRecord = await RecordCollection.create({
    id: `rec-${Date.now()}`,
    patientId,
    patientName: patient ? patient.fullName : 'Patient',
    patientAge: patient?.age,
    patientGender: patient?.gender,
    doctorId,
    doctorName: doctor ? doctor.fullName : 'Doctor',
    visitDate: visitDate || new Date().toISOString().split('T')[0],
    symptoms: symptoms || '',
    diagnosis: diagnosis || 'General Clinical Review',
    treatment: treatment || '',
    notes: notes || '',
    status: 'Completed',
    prescription: createdPrescription,
    appointmentId,
    createdAt: new Date().toISOString(),
  });

  // If there was an associated appointment, mark it completed
  if (appointmentId) {
    await AppointmentCollection.findByIdAndUpdate(appointmentId, { status: 'Completed' });
  }

  res.status(201).json(newRecord);
};
