import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
  Prescription,
  ClinicSettings,
  AppointmentStatus,
} from '../types/clinic';
import {
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_RECORDS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_SETTINGS,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ClinicContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole, doctorId?: string) => void;
  
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
  settings: ClinicSettings;

  addPatient: (data: Partial<Patient>) => Promise<Patient>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;

  addDoctor: (data: Partial<Doctor>) => Promise<Doctor>;
  deleteDoctor: (id: string) => Promise<void>;

  bookAppointment: (data: Partial<Appointment>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;

  saveConsultation: (data: {
    patientId: string;
    doctorId: string;
    visitDate: string;
    symptoms: string;
    diagnosis: string;
    treatment: string;
    notes?: string;
    medicines?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    prescriptionInstructions?: string;
    appointmentId?: string;
  }) => Promise<{ record: MedicalRecord; prescription?: Prescription }>;

  createPrescription: (data: Partial<Prescription>) => Promise<Prescription>;
  updateSettings: (data: Partial<ClinicSettings>) => Promise<void>;

  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;

  selectedPatientForConsultation: Patient | null;
  selectedAppointmentForConsultation: Appointment | null;
  startConsultation: (patient: Patient, appointment?: Appointment) => void;
  clearConsultation: () => void;

  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedDoctorId: string | null;
  setSelectedDoctorId: (id: string | null) => void;
  printablePrescription: Prescription | null;
  setPrintablePrescription: (rx: Prescription | null) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-seed with admin user for smooth demo, or restore from storage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('carepoint_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS[0]; // Default to Admin
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('carepoint_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('carepoint_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('carepoint_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('carepoint_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('carepoint_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [settings, setSettings] = useState<ClinicSettings>(() => {
    const saved = localStorage.getItem('carepoint_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [printablePrescription, setPrintablePrescription] = useState<Prescription | null>(null);

  // Active consultation state
  const [selectedPatientForConsultation, setSelectedPatientForConsultation] = useState<Patient | null>(null);
  const [selectedAppointmentForConsultation, setSelectedAppointmentForConsultation] = useState<Appointment | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('carepoint_patients', JSON.stringify(patients));
  }, [patients]);

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('carepoint_token') || 'jwt-carepoint-user-admin-default';
  });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken || localStorage.getItem('carepoint_token') || (currentUser ? `jwt-carepoint-${currentUser.id}` : '')}`,
    'X-User-Role': currentUser?.role || 'admin',
  });

  // Strict RBAC Tab Sanitizer
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      if (currentTab === 'consultation') {
        setCurrentTab('dashboard');
      }
    } else if (currentUser?.role === 'doctor') {
      if (currentTab === 'doctors' || currentTab === 'settings') {
        setCurrentTab('dashboard');
      }
    }
  }, [currentUser?.role, currentTab]);

  useEffect(() => {
    localStorage.setItem('carepoint_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('carepoint_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('carepoint_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('carepoint_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('carepoint_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('carepoint_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('carepoint_user');
    }
  }, [currentUser]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = async (email: string, password = 'password123', remember = true): Promise<boolean> => {
    const normalized = email.trim().toLowerCase();
    const found = INITIAL_USERS.find((u) => u.email.toLowerCase() === normalized);
    
    // Also try checking backend API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.token) {
          setAuthToken(data.token);
          localStorage.setItem('carepoint_token', data.token);
        }
        if (remember) {
          localStorage.setItem('carepoint_user', JSON.stringify(data.user));
        }
        // Redirect to initial role dashboard
        setCurrentTab('dashboard');
        addToast('success', 'Welcome back!', `Signed in as ${data.user.name} (${data.user.role === 'admin' ? 'Administrator' : 'Doctor'})`);
        return true;
      }
    } catch {
      // Fallback to local users
    }

    if (found) {
      setCurrentUser(found);
      const generatedToken = `jwt-carepoint-${found.id}-${Date.now()}`;
      setAuthToken(generatedToken);
      localStorage.setItem('carepoint_token', generatedToken);
      if (remember) {
        localStorage.setItem('carepoint_user', JSON.stringify(found));
      }
      setCurrentTab('dashboard');
      addToast('success', 'Welcome back!', `Signed in as ${found.name} (${found.role === 'admin' ? 'Administrator' : 'Doctor'})`);
      return true;
    }

    addToast('error', 'Login Failed', 'Invalid email or password.');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('carepoint_user');
    localStorage.removeItem('carepoint_token');
    addToast('info', 'Logged Out', 'You have been safely signed out.');
  };

  const switchRole = (role: UserRole, doctorId?: string) => {
    if (role === 'admin') {
      const admin = INITIAL_USERS.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      setCurrentUser(admin);
      setAuthToken(`jwt-carepoint-${admin.id}`);
      addToast('info', 'Switched Role', 'Now viewing as Administrator');
    } else {
      const doc = INITIAL_USERS.find((u) => (doctorId ? u.id === doctorId : u.role === 'doctor')) || INITIAL_USERS[1];
      setCurrentUser(doc);
      setAuthToken(`jwt-carepoint-${doc.id}`);
      addToast('info', 'Switched Role', `Now viewing as ${doc.name} (Doctor)`);
    }
    setCurrentTab('dashboard');
  };

  const startConsultation = (patient: Patient, appointment?: Appointment) => {
    setSelectedPatientForConsultation(patient);
    setSelectedAppointmentForConsultation(appointment || null);
    setCurrentTab('consultation');
  };

  const clearConsultation = () => {
    setSelectedPatientForConsultation(null);
    setSelectedAppointmentForConsultation(null);
  };

  const addPatient = async (data: Partial<Patient>): Promise<Patient> => {
    let age = 30;
    if (data.dob) {
      const birthYear = new Date(data.dob).getFullYear();
      if (!isNaN(birthYear)) {
        age = new Date().getFullYear() - birthYear;
      }
    }

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      patientId: `PT-00${124 + patients.length}`,
      fullName: data.fullName || 'New Patient',
      dob: data.dob || '1995-01-01',
      age,
      gender: data.gender || 'Male',
      phone: data.phone || '+256 700 000000',
      email: data.email || '',
      address: data.address || '',
      emergencyContact: data.emergencyContact || 'Not provided',
      bloodGroup: data.bloodGroup || 'O+',
      allergies: data.allergies || 'None reported',
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      notes: data.notes || '',
    };

    setPatients((prev) => [newPatient, ...prev]);

    // Send to backend API with RBAC auth headers
    fetch('/api/patients', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newPatient),
    }).catch(console.error);

    addToast('success', 'Patient Added', `${newPatient.fullName} has been registered successfully.`);
    return newPatient;
  };

  const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
    let updated: Patient | null = null;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id || p.patientId === id) {
          updated = { ...p, ...data };
          return updated;
        }
        return p;
      })
    );

    fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).catch(console.error);

    addToast('success', 'Patient Updated', 'Patient details updated successfully.');
    return updated || (data as Patient);
  };

  const deletePatient = async (id: string): Promise<void> => {
    if (currentUser?.role !== 'admin') {
      addToast('error', 'Access Denied', 'Only administrators can delete patients.');
      return;
    }
    setPatients((prev) => prev.filter((p) => p.id !== id && p.patientId !== id));
    fetch(`/api/patients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).catch(console.error);
    addToast('info', 'Patient Removed', 'Patient record has been deleted.');
  };

  const addDoctor = async (data: Partial<Doctor>): Promise<Doctor> => {
    if (currentUser?.role !== 'admin') {
      addToast('error', 'Access Denied', 'Only administrators can register doctors.');
      throw new Error('Unauthorized');
    }

    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      fullName: data.fullName || 'Dr. New Doctor',
      email: data.email || 'doctor@carepoint.com',
      phone: data.phone || '+256 700 000000',
      specialization: data.specialization || 'General Physician',
      licenseNumber: data.licenseNumber || `MD-UG-${Math.floor(10000 + Math.random() * 90000)}`,
      gender: data.gender || 'Female',
      dob: data.dob || '1985-01-01',
      address: data.address || 'Kampala, Uganda',
      schedule: {
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
    };

    setDoctors((prev) => [...prev, newDoc]);
    fetch('/api/doctors', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newDoc),
    }).catch(console.error);

    addToast('success', 'Doctor Added', `${newDoc.fullName} has been registered.`);
    return newDoc;
  };

  const deleteDoctor = async (id: string): Promise<void> => {
    if (currentUser?.role !== 'admin') {
      addToast('error', 'Access Denied', 'Only administrators can remove doctors.');
      return;
    }

    setDoctors((prev) => prev.filter((d) => d.id !== id));
    fetch(`/api/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).catch(console.error);
    addToast('info', 'Doctor Removed', 'Doctor removed from active roster.');
  };

  const bookAppointment = async (data: Partial<Appointment>): Promise<Appointment> => {
    const patient = patients.find((p) => p.id === data.patientId || p.patientId === data.patientId);
    const doctor = doctors.find((d) => d.id === data.doctorId);

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      appointmentId: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: data.patientId || (patient?.id ?? 'pat-1'),
      patientName: patient?.fullName || 'Registered Patient',
      patientPhone: patient?.phone || '+256 700 000000',
      patientGender: patient?.gender,
      patientAge: patient?.age,
      doctorId: data.doctorId || (doctor?.id ?? 'doc-amina'),
      doctorName: doctor?.fullName || 'Dr. Amina Hassan',
      doctorSpecialization: doctor?.specialization || 'General Physician',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '10:00 AM',
      type: data.type || 'General Checkup',
      reason: data.reason || 'General clinical visit',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newApt, ...prev]);
    fetch('/api/appointments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newApt),
    }).catch(console.error);

    addToast('success', 'Appointment Booked', `Booked for ${newApt.patientName} with ${newApt.doctorName}.`);
    return newApt;
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus): Promise<void> => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id || a.appointmentId === id ? { ...a, status } : a))
    );
    fetch(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }).catch(console.error);

    addToast('info', 'Status Updated', `Appointment status set to ${status}.`);
  };

  const saveConsultation = async (data: {
    patientId: string;
    doctorId: string;
    visitDate: string;
    symptoms: string;
    diagnosis: string;
    treatment: string;
    notes?: string;
    medicines?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    prescriptionInstructions?: string;
    appointmentId?: string;
  }): Promise<{ record: MedicalRecord; prescription?: Prescription }> => {
    const patient = patients.find((p) => p.id === data.patientId || p.patientId === data.patientId);
    const doctor = doctors.find((d) => d.id === data.doctorId);

    let createdPrescription: Prescription | undefined = undefined;

    if (data.medicines && data.medicines.length > 0) {
      createdPrescription = {
        id: `rx-${Date.now()}`,
        prescriptionNumber: `RX-2026-0${80 + prescriptions.length + 1}`,
        patientId: data.patientId,
        patientName: patient?.fullName || 'Patient',
        doctorId: data.doctorId,
        doctorName: doctor?.fullName || 'Consulting Doctor',
        date: data.visitDate,
        medicines: data.medicines.map((m, idx) => ({
          id: `med-${Date.now()}-${idx}`,
          ...m,
        })),
        instructions: data.prescriptionInstructions || 'Take medication after meals.',
        status: 'Active',
      };
      setPrescriptions((prev) => [createdPrescription!, ...prev]);
    }

    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patientId: data.patientId,
      patientName: patient?.fullName || 'Patient',
      patientAge: patient?.age,
      patientGender: patient?.gender,
      doctorId: data.doctorId,
      doctorName: doctor?.fullName || 'Consulting Doctor',
      visitDate: data.visitDate,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      notes: data.notes || '',
      status: 'Completed',
      prescription: createdPrescription,
      appointmentId: data.appointmentId,
      createdAt: new Date().toISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Mark appointment as Completed if associated
    if (data.appointmentId) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === data.appointmentId || a.appointmentId === data.appointmentId
            ? { ...a, status: 'Completed' }
            : a
        )
      );
    }

    fetch('/api/medical-records', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        prescription: createdPrescription,
      }),
    }).catch(console.error);

    addToast('success', 'Consultation Saved', `Consultation for ${newRecord.patientName} saved successfully.`);
    return { record: newRecord, prescription: createdPrescription };
  };

  const createPrescription = async (data: Partial<Prescription>): Promise<Prescription> => {
    const patient = patients.find((p) => p.id === data.patientId || p.patientId === data.patientId);
    const doctor = doctors.find((d) => d.id === data.doctorId);

    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      prescriptionNumber: `RX-2026-0${80 + prescriptions.length + 1}`,
      patientId: data.patientId || 'pat-1',
      patientName: patient?.fullName || 'Patient',
      doctorId: data.doctorId || 'doc-amina',
      doctorName: doctor?.fullName || 'Doctor',
      date: data.date || new Date().toISOString().split('T')[0],
      medicines: data.medicines || [],
      instructions: data.instructions || 'Take medications after meals as directed.',
      status: 'Active',
    };

    setPrescriptions((prev) => [newRx, ...prev]);
    fetch('/api/prescriptions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newRx),
    }).catch(console.error);

    addToast('success', 'Prescription Created', `Prescription ${newRx.prescriptionNumber} saved.`);
    return newRx;
  };

  const updateSettings = async (data: Partial<ClinicSettings>): Promise<void> => {
    if (currentUser?.role !== 'admin') {
      addToast('error', 'Access Denied', 'Only administrators can update clinic settings.');
      return;
    }

    setSettings((prev) => ({ ...prev, ...data }));
    fetch('/api/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).catch(console.error);

    addToast('success', 'Settings Updated', 'Settings updated successfully.');
  };

  return (
    <ClinicContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchRole,
        patients,
        doctors,
        appointments,
        records,
        prescriptions,
        settings,
        addPatient,
        updatePatient,
        deletePatient,
        addDoctor,
        deleteDoctor,
        bookAppointment,
        updateAppointmentStatus,
        saveConsultation,
        createPrescription,
        updateSettings,
        toasts,
        addToast,
        removeToast,
        selectedPatientForConsultation,
        selectedAppointmentForConsultation,
        startConsultation,
        clearConsultation,
        currentTab,
        setCurrentTab,
        selectedPatientId,
        setSelectedPatientId,
        selectedDoctorId,
        setSelectedDoctorId,
        printablePrescription,
        setPrintablePrescription,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
