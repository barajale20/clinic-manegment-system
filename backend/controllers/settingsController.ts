import { Request, Response } from 'express';
import { SettingsStore } from '../config/store.ts';

export const getSettings = (_req: Request, res: Response) => {
  const current = SettingsStore.get();
  res.json(current);
};

export const updateSettings = (req: Request, res: Response) => {
  const updated = SettingsStore.update(req.body);
  res.json(updated);
};
