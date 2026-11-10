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
  isLoading: boolean;
  login: (email: string, password?: string, remember?: boolean, role?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole, doctorId?: string) => void;

  pendingUsers: any[];
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  registerUser: (userData: { fullName: string; email: string; role: string; password?: string }) => Promise<boolean>;

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

const API_BASE_URL = 'http://localhost:3000/api';

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [pendingUsers, setPendingUsers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('carepoint_pending_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
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

  const [selectedPatientForConsultation, setSelectedPatientForConsultation] = useState<Patient | null>(null);
  const [selectedAppointmentForConsultation, setSelectedAppointmentForConsultation] = useState<Appointment | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem('carepoint_token')
  );

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    window.setTimeout(() => removeToast(id), 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Restore the signed-in user from this browser.
  useEffect(() => {
    const savedUser = localStorage.getItem('carepoint_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('carepoint_user');
        localStorage.removeItem('carepoint_token');
        setAuthToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading || !currentUser || !authToken) return;

    const role = String(currentUser.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'administrator') return;

    void fetchPendingUsers();

    const intervalId = window.setInterval(() => {
      void fetchPendingUsers();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [currentUser, authToken, isLoading]);

  useEffect(() => {
    if (!currentUser) return;
    const role = (currentUser.role || '').toLowerCase();

    if (role === 'admin' || role === 'administrator') {
      if (currentTab === 'consultation') setCurrentTab('dashboard');
    } else if (role === 'doctor') {
      if (currentTab === 'doctors' || currentTab === 'settings') setCurrentTab('dashboard');
    }
  }, [currentUser?.role, currentTab]);

  useEffect(() => {
    localStorage.setItem('carepoint_patients', JSON.stringify(patients));
  }, [patients]);

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

  const fetchPendingUsers = async () => {
    if (!authToken || !currentUser) return;

    const role = String(currentUser.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'administrator') return;

    try {
      const res = await fetch(`${API_BASE_URL}/pending-users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Unable to load registration requests (${res.status})`);
      }

      const usersList = Array.isArray(data.users) ? data.users : [];
      setPendingUsers(usersList);
      localStorage.setItem('carepoint_pending_users', JSON.stringify(usersList));
    } catch (error) {
      console.error('Failed to load pending users from MongoDB:', error);
    }
  };

  const registerUser = async (userData: {
    fullName: string;
    email: string;
    role: string;
    password?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        addToast(
          'error',
          'Registration Failed',
          data.message || 'Your registration could not be saved. Please try again.'
        );
        return false;
      }

      addToast(
        'success',
        'Registration Submitted',
        data.message || 'Your account is saved and awaiting admin approval.'
      );
      return true;
    } catch (error) {
      console.error('Registration request failed:', error);
      addToast(
        'error',
        'Registration Failed',
        'Cannot connect to the server. Please check that the clinic server is running.'
      );
      return false;
    }
  };

  const updateRegistrationStatus = async (
    userId: string,
    status: 'approved' | 'rejected'
  ): Promise<void> => {
    if (!authToken) {
      addToast('error', 'Authentication Required', 'Please log in again as an administrator.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Could not ${status} this registration.`);
      }

      setPendingUsers((prev) => {
        const updated = prev.filter(
          (user) => String(user._id || user.id) !== String(userId)
        );
        localStorage.setItem('carepoint_pending_users', JSON.stringify(updated));
        return updated;
      });

      if (status === 'approved') {
        addToast('success', 'Registration Approved', 'The account is approved and can now log in.');
      } else {
        addToast('info', 'Registration Rejected', 'The registration request has been rejected.');
      }

      await fetchPendingUsers();
    } catch (error) {
      console.error(`Failed to set user status to ${status}:`, error);
      addToast(
        'error',
        'Update Failed',
        error instanceof Error ? error.message : 'The server could not update this account.'
      );
    }
  };

  const approveUser = (userId: string) => updateRegistrationStatus(userId, 'approved');
  const rejectUser = (userId: string) => updateRegistrationStatus(userId, 'rejected');

  // IMPORTANT: send the selected role to the API. The backend validates it
  // against the role stored for this email in MongoDB.
  const login = async (
    email: string,
    password = '',
    remember = true,
    role?: string
  ): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      addToast('warning', 'Login Notice', 'Please enter your email and password.');
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          role: role || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.user || !data.token) {
        console.error('Login API rejected the request:', {
          status: res.status,
          message: data.message,
        });
        addToast(
          'warning',
          'Login Notice',
          data.message || `Login failed (HTTP ${res.status}). Check your credentials and selected role.`
        );
        return false;
      }

      const loggedUser = data.user;

      // Extra frontend check: do not let a different selected role continue.
      if (
        role &&
        String(loggedUser.role || '').trim().toLowerCase() !==
          String(role).trim().toLowerCase() &&
        !(role.toLowerCase() === 'administrator' && loggedUser.role === 'Admin')
      ) {
        addToast('error', 'Role Mismatch', 'The selected role does not match this account.');
        return false;
      }

      setCurrentUser(loggedUser);
      setAuthToken(data.token);
      localStorage.setItem('carepoint_token', data.token);

      if (remember) {
        localStorage.setItem('carepoint_user', JSON.stringify(loggedUser));
      } else {
        localStorage.removeItem('carepoint_user');
      }

      setCurrentTab('dashboard');
      addToast(
        'success',
        'Welcome back!',
        `Signed in as ${loggedUser.fullName || loggedUser.name} (${loggedUser.role})`
      );
      return true;
    } catch (error) {
      console.error('Login request failed:', error);
      addToast(
        'error',
        'Login Failed',
        'Unable to connect to the clinic server. Please check that the server is running.'
      );
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('carepoint_user');
    localStorage.removeItem('carepoint_token');
    setPendingUsers([]);
    localStorage.removeItem('carepoint_pending_users');
    addToast('info', 'Logged Out', 'You have been safely signed out.');
  };

  // Kept for compatibility with the existing UI/demo functionality.
  // Do not use switchRole as a real authentication mechanism.
  const switchRole = (role: UserRole, doctorId?: string) => {
    if (role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator') {
      const admin = INITIAL_USERS.find((user) => user.role.toLowerCase() === 'admin') || INITIAL_USERS[0];
      setCurrentUser({ ...admin, role: 'Admin' });
      addToast('info', 'Switched Role', 'Now viewing as Administrator');
    } else {
      const doctor =
        INITIAL_USERS.find((user) =>
          doctorId ? user.id === doctorId : user.role.toLowerCase() === 'doctor'
        ) || INITIAL_USERS[1];
      setCurrentUser(doctor);
      addToast('info', 'Switched Role', `Now viewing as ${doctor.name} (Doctor)`);
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
      if (!isNaN(birthYear)) age = new Date().getFullYear() - birthYear;
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
    addToast('success', 'Patient Added', `${newPatient.fullName} has been registered successfully.`);
    return newPatient;
  };

  const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
    let updated: Patient | null = null;
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id === id || patient.patientId === id) {
          updated = { ...patient, ...data };
          return updated;
        }
        return patient;
      })
    );
    addToast('success', 'Patient Updated', 'Patient details updated successfully.');
    return updated || (data as Patient);
  };

  const deletePatient = async (id: string): Promise<void> => {
    if (
      currentUser?.role?.toLowerCase() !== 'admin' &&
      currentUser?.role?.toLowerCase() !== 'administrator'
    ) {
      addToast('error', 'Access Denied', 'Only administrators can delete patients.');
      return;
    }
    setPatients((prev) => prev.filter((patient) => patient.id !== id && patient.patientId !== id));
    addToast('info', 'Patient Removed', 'Patient record has been deleted.');
  };

  const addDoctor = async (data: Partial<Doctor>): Promise<Doctor> => {
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
      schedule: { Monday: '09:00 AM – 04:00 PM' },
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1594824813576-928df7764d8a?auto=format&fit=crop&q=80&w=256',
      appointmentsCount: 0,
      completedVisitsCount: 0,
      upcomingCount: 0,
    };
    setDoctors((prev) => [...prev, newDoc]);
    addToast('success', 'Doctor Added', `${newDoc.fullName} has been registered.`);
    return newDoc;
  };

  const deleteDoctor = async (id: string): Promise<void> => {
    setDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
    addToast('info', 'Doctor Removed', 'Doctor removed from active roster.');
  };

  const bookAppointment = async (data: Partial<Appointment>): Promise<Appointment> => {
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      appointmentId: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: data.patientId || 'pat-1',
      patientName: 'Registered Patient',
      patientPhone: '+256 700 000000',
      doctorId: data.doctorId || 'doc-amina',
      doctorName: 'Dr. Amina Hassan',
      doctorSpecialization: 'General Physician',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '10:00 AM',
      type: data.type || 'General Checkup',
      reason: data.reason || 'General clinical visit',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newApt, ...prev]);
    addToast('success', 'Appointment Booked', 'Booked successfully.');
    return newApt;
  };

  const updateAppointmentStatus = async (
    id: string,
    status: AppointmentStatus
  ): Promise<void> => {
    setAppointments((prev) =>
      prev.map((appointment) => (appointment.id === id ? { ...appointment, status } : appointment))
    );
    addToast('info', 'Status Updated', `Appointment status set to ${status}.`);
  };

  const saveConsultation = async (
    data: any
  ): Promise<{ record: MedicalRecord; prescription?: Prescription }> => {
    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patientId: data.patientId,
      patientName: 'Patient',
      doctorId: data.doctorId,
      doctorName: 'Doctor',
      visitDate: data.visitDate,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      status: 'Completed',
      createdAt: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    addToast('success', 'Consultation Saved', 'Consultation saved successfully.');
    return { record: newRecord };
  };

  const createPrescription = async (data: Partial<Prescription>): Promise<Prescription> => {
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      prescriptionNumber: `RX-2026-0${80 + prescriptions.length + 1}`,
      patientId: 'pat-1',
      patientName: 'Patient',
      doctorId: 'doc-amina',
      doctorName: 'Doctor',
      date: new Date().toISOString().split('T')[0],
      medicines: data.medicines || [],
      instructions: 'Take as directed.',
      status: 'Active',
    };
    setPrescriptions((prev) => [newRx, ...prev]);
    addToast('success', 'Prescription Created', 'Prescription saved.');
    return newRx;
  };

  const updateSettings = async (data: Partial<ClinicSettings>): Promise<void> => {
    setSettings((prev) => ({ ...prev, ...data }));
    addToast('success', 'Settings Updated', 'Settings updated successfully.');
  };

  return (
    <ClinicContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        switchRole,
        pendingUsers,
        approveUser,
        rejectUser,
        registerUser,
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
