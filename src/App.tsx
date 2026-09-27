import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { PrintPrescriptionModal } from './components/common/PrintPrescriptionModal';
import { AccessDeniedGuard } from './components/common/AccessDeniedGuard';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PatientsManagement } from './components/admin/PatientsManagement';
import { DoctorsManagement } from './components/admin/DoctorsManagement';
import { ClinicSettings } from './components/admin/ClinicSettings';

// Doctor Components
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { DoctorAppointments } from './components/doctor/DoctorAppointments';
import { DoctorPatientDetails } from './components/doctor/DoctorPatientDetails';
import { ConsultationWorkflow } from './components/doctor/ConsultationWorkflow';

// Shared / Clinical Views
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { MedicalRecordsView } from './components/records/MedicalRecordsView';
import { PrescriptionsView } from './components/prescriptions/PrescriptionsView';
import { Patient } from './types/clinic';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    currentTab,
    setCurrentTab,
    printablePrescription,
    setPrintablePrescription,
    startConsultation,
    patients,
  } = useClinic();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedPatientForDoctorDetail, setSelectedPatientForDoctorDetail] = useState<Patient | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isAdmin = currentUser?.role === 'admin';
  const isDoctor = currentUser?.role === 'doctor';

  // Determine page title and subtitle for Header dynamically based on role
  let pageTitle = 'Dashboard';
  let pageSubtitle = 'Overview of your clinic’s activities.';

  if (currentTab === 'dashboard') {
    pageTitle = isAdmin ? 'Admin Dashboard' : `Good morning, ${currentUser?.name.split(' ')[0] === 'Dr.' ? currentUser?.name : `Dr. ${currentUser?.name}`}`;
    pageSubtitle = isAdmin ? 'Clinic operations, stats, and administration summary.' : 'Here is your clinical schedule and patient queue for today.';
  } else if (currentTab === 'patients') {
    pageTitle = isAdmin ? 'Patients Management' : 'My Patients';
    pageSubtitle = isAdmin ? 'Register, search, and manage clinic patient files.' : 'Review patient medical histories and clinical records.';
  } else if (currentTab === 'doctors') {
    pageTitle = 'Doctors Directory';
    pageSubtitle = 'Manage clinical practitioners, specializations, and schedules.';
  } else if (currentTab === 'appointments') {
    pageTitle = isDoctor ? 'My Appointments' : 'Clinic Appointments';
    pageSubtitle = isDoctor ? 'Review your scheduled visits and initiate patient consultations.' : 'Clinic-wide schedule and appointment bookings.';
  } else if (currentTab === 'records') {
    pageTitle = isDoctor ? 'Clinical Records' : 'Medical Records Archive';
    pageSubtitle = 'Consultation diagnosis logs, patient charts, and medical history.';
  } else if (currentTab === 'prescriptions') {
    pageTitle = isDoctor ? 'Prescriptions Issued' : 'Pharmacy Prescriptions';
    pageSubtitle = 'Medication regimens, dosage instructions, and printable Rx slips.';
  } else if (currentTab === 'settings') {
    pageTitle = 'Clinic System Settings';
    pageSubtitle = 'Configure operating hours, clinic contact information, and preferences.';
  } else if (currentTab === 'consultation') {
    pageTitle = 'Patient Consultation Workflow';
    pageSubtitle = 'Active clinical diagnosis, SOAP notes, and electronic prescription.';
  } else if (currentTab === 'patient-detail') {
    pageTitle = 'Patient Clinical File';
    pageSubtitle = selectedPatientForDoctorDetail?.fullName || 'Patient record';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Responsive Role-Aware Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
          title={pageTitle}
          subtitle={pageSubtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB: DASHBOARD */}
          {currentTab === 'dashboard' && (
            isAdmin ? (
              <AdminDashboard
                onAddPatient={() => setCurrentTab('patients')}
                onAddDoctor={() => setCurrentTab('doctors')}
                onBookAppointment={() => setCurrentTab('appointments')}
                onViewPatient={(_id) => {
                  setCurrentTab('patients');
                }}
                onViewAppointment={(_id) => {
                  setCurrentTab('appointments');
                }}
              />
            ) : (
              <DoctorDashboard
                onStartConsultationForPatient={(patientId, appointmentId) => {
                  const pat = patients.find((p) => p.id === patientId || p.patientId === patientId);
                  if (pat) {
                    startConsultation(pat);
                  }
                }}
                onViewAppointmentDetails={(_id) => {
                  setCurrentTab('appointments');
                }}
              />
            )
          )}

          {/* TAB: PATIENTS */}
          {currentTab === 'patients' && (
            isDoctor && selectedPatientForDoctorDetail ? (
              <DoctorPatientDetails
                patient={selectedPatientForDoctorDetail}
                onBack={() => setSelectedPatientForDoctorDetail(null)}
                onStartConsultation={(pat) => {
                  setSelectedPatientForDoctorDetail(null);
                  startConsultation(pat);
                }}
              />
            ) : (
              <PatientsManagement
                onBookAppointmentForPatient={(_patId) => {
                  setCurrentTab('appointments');
                }}
              />
            )
          )}

          {/* TAB: DOCTORS (Strictly Admin only) */}
          {currentTab === 'doctors' && (
            isAdmin ? (
              <DoctorsManagement />
            ) : (
              <AccessDeniedGuard
                requiredRole="admin"
                resourceName="Doctors Directory & Practitioner Management"
              />
            )
          )}

          {/* TAB: APPOINTMENTS */}
          {currentTab === 'appointments' && (
            isDoctor ? <DoctorAppointments /> : <AppointmentsView />
          )}

          {/* TAB: MEDICAL RECORDS */}
          {currentTab === 'records' && <MedicalRecordsView />}

          {/* TAB: PRESCRIPTIONS */}
          {currentTab === 'prescriptions' && <PrescriptionsView />}

          {/* TAB: SETTINGS (Strictly Admin only) */}
          {currentTab === 'settings' && (
            isAdmin ? (
              <ClinicSettings />
            ) : (
              <AccessDeniedGuard
                requiredRole="admin"
                resourceName="Clinic Preferences & System Settings"
              />
            )
          )}

          {/* TAB: CONSULTATION (Strictly Doctor clinical workflow) */}
          {currentTab === 'consultation' && (
            isDoctor ? (
              <ConsultationWorkflow
                onBackToAppointments={() => setCurrentTab('appointments')}
              />
            ) : (
              <AccessDeniedGuard
                requiredRole="doctor"
                resourceName="Clinical Examination & Prescription Builder"
              />
            )
          )}
        </main>
      </div>

      {/* Global Printable Prescription Document Modal */}
      <PrintPrescriptionModal
        prescription={printablePrescription}
        onClose={() => setPrintablePrescription(null)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainLayout />
    </ClinicProvider>
  );
}
