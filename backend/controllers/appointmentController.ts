
import { Request, Response } from 'express';
import {
  AppointmentCollection,
  PatientCollection,
  DoctorCollection,
} from '../config/store.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

const VALID_STATUSES = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
] as const;

export const getAppointments = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { doctorId, date, status, patientId } = req.query;
    let list = await AppointmentCollection.find();

    const user = req.user;
    const role = user?.role?.toLowerCase();

    // Doctors can only view their own appointments.
    if (role === 'doctor') {
      list = list.filter(
        (appointment) => appointment.doctorId === user?.id,
      );
    } else if (doctorId) {
      list = list.filter(
        (appointment) => appointment.doctorId === String(doctorId),
      );
    }

    if (patientId) {
      list = list.filter(
        (appointment) => appointment.patientId === String(patientId),
      );
    }

    if (date) {
      list = list.filter(
        (appointment) => appointment.date === String(date),
      );
    }

    if (status && status !== 'all') {
      list = list.filter(
        (appointment) => appointment.status === String(status),
      );
    }

    return res.json(list);
  } catch (error) {
    console.error('getAppointments error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve appointments.',
    });
  }
};

export const createAppointment = async (
  req: Request,
  res: Response,
) => {
  try {
    const { patientId, doctorId, date, time, type, reason } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({
        error: 'Patient, Doctor, Date, and Time are required.',
      });
    }

    const patient = await PatientCollection.findById(patientId);
    const doctor = await DoctorCollection.findById(doctorId);

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found.',
      });
    }

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found.',
      });
    }

    const newAppointment = await AppointmentCollection.create({
      id: `apt-${Date.now()}`,
      appointmentId: `APT-${Date.now()}`,
      patientId,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      patientGender: patient.gender,
      patientAge: patient.age,
      doctorId,
      doctorName: doctor.fullName,
      doctorSpecialization: doctor.specialization,
      date,
      time,
      type: type || 'General Checkup',
      reason: reason || 'Routine clinical appointment',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error('createAppointment error:', error);
    return res.status(500).json({
      error: 'Failed to create appointment.',
    });
  }
};

export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      typeof status !== 'string' ||
      !VALID_STATUSES.includes(
        status as (typeof VALID_STATUSES)[number],
      )
    ) {
      return res.status(400).json({
        error: 'Invalid appointment status.',
        validStatuses: VALID_STATUSES,
      });
    }

    const updated = await AppointmentCollection.findByIdAndUpdate(
      id,
      { status },
    );

    if (!updated) {
      return res.status(404).json({
        error: 'Appointment not found.',
      });
    }

    return res.json(updated);
  } catch (error) {
    console.error('updateAppointmentStatus error:', error);
    return res.status(500).json({
      error: 'Failed to update appointment status.',
    });
  }
};

export const deleteAppointment = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const deleted = await AppointmentCollection.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Appointment not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Appointment deleted successfully.',
    });
  } catch (error) {
    console.error('deleteAppointment error:', error);
    return res.status(500).json({
      error: 'Failed to delete appointment.',
    });
  }
};
