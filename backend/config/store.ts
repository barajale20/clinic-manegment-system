import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_RECORDS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
} from '../../src/data/initialData.ts';

// In-Memory Document Collections mirroring MongoDB schemas
class MongoCollection<T extends { id?: string; _id?: string }> {
  private documents: T[];

  constructor(initialData: T[] = []) {
    this.documents = JSON.parse(JSON.stringify(initialData));
  }

  async find(filter?: Partial<T> | ((doc: T) => boolean)): Promise<T[]> {
    if (!filter) return [...this.documents];
    if (typeof filter === 'function') {
      return this.documents.filter(filter);
    }
    return this.documents.filter((doc) => {
      return Object.entries(filter).every(([key, val]) => (doc as any)[key] === val);
    });
  }

  async findById(id: string): Promise<T | null> {
    const doc = this.documents.find((d: any) => d.id === id || d._id === id || d.patientId === id || d.appointmentId === id);
    return doc ? { ...doc } : null;
  }

  async findOne(filter: Partial<T> | ((doc: T) => boolean)): Promise<T | null> {
    const results = await this.find(filter);
    return results.length > 0 ? { ...results[0] } : null;
  }

  async create(doc: T): Promise<T> {
    const newDoc = {
      ...doc,
      _id: (doc as any)._id || (doc as any).id || `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: (doc as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.documents.unshift(newDoc);
    return { ...newDoc };
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const index = this.documents.findIndex(
      (d: any) => d.id === id || d._id === id || d.patientId === id || d.appointmentId === id
    );
    if (index === -1) return null;
    this.documents[index] = {
      ...this.documents[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.documents[index] };
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    const initialLen = this.documents.length;
    this.documents = this.documents.filter(
      (d: any) => d.id !== id && d._id !== id && d.patientId !== id && d.appointmentId !== id
    );
    return this.documents.length < initialLen;
  }

  async countDocuments(filter?: Partial<T>): Promise<number> {
    const list = await this.find(filter);
    return list.length;
  }

  getAllDirect(): T[] {
    return this.documents;
  }
}

// Global initialized collections
export const UserCollection = new MongoCollection<any>(INITIAL_USERS);
export const PatientCollection = new MongoCollection<any>(INITIAL_PATIENTS);
export const DoctorCollection = new MongoCollection<any>(INITIAL_DOCTORS);
export const AppointmentCollection = new MongoCollection<any>(INITIAL_APPOINTMENTS);
export const RecordCollection = new MongoCollection<any>(INITIAL_RECORDS);
export const PrescriptionCollection = new MongoCollection<any>(INITIAL_PRESCRIPTIONS);

let clinicSettingsDoc = { ...INITIAL_SETTINGS };

export const SettingsStore = {
  get: () => ({ ...clinicSettingsDoc }),
  update: (updates: any) => {
    clinicSettingsDoc = { ...clinicSettingsDoc, ...updates };
    return { ...clinicSettingsDoc };
  },
};
