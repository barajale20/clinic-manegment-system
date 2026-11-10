import { Request, Response } from 'express';
import { PatientModel } from '../models/Patient'; // Iyadoo la raacayo halka uu modalku ku jiro

// Helitaanka dhammaan bukaanada
export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await PatientModel.find();
    res.status(200).json({ success: true, data: patients });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Abuurista bukaan cusub
export const createPatient = async (req: Request, res: Response) => {
  try {
    const newPatient = await PatientModel.create(req.body);
    res.status(201).json({ success: true, data: newPatient });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};