import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types/clinic';
import {
  Stethoscope,
  FileText,
  Printer,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  HeartPulse,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface DoctorPatientDetailsProps {
  patient: Patient;
  onBack: () => void;
  onStartConsultation: (patient: Patient) => void;
}

export const DoctorPatientDetails: React.FC<DoctorPatientDetailsProps> = ({
  patient,
  onBack,
  onStartConsultation,
}) => {
  const { appointments, records, prescriptions, setPrintablePrescription } = useClinic();

  const patientAppointments = appointments.filter(
    (a) => a.patientId === patient.id || a.patientId === patient.patientId
  );

  const patientRecords = records.filter(
    (r) => r.patientId === patient.id || r.patientId === patient.patientId
  );

  const patientPrescriptions = prescriptions.filter(
    (p) => p.patientId === patient.id || p.patientId === patient.patientId
  );

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Patients
      </button>

      {/* Patient Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-xs">
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{patient.fullName}</h2>
              <Badge status={patient.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Patient ID: <span className="font-semibold text-indigo-700">{patient.patientId}</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {patient.age} years · {patient.gender} · Reg: {patient.registrationDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartConsultation(patient)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Stethoscope className="w-4 h-4" />
            Start Consultation
          </button>
        </div>
      </div>

      {/* 2-Column Information: Personal & Medical */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Personal Information
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-semibold text-slate-900">{patient.fullName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-mono text-slate-900">{patient.dob || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Gender:</span>
              <span className="text-slate-900">{patient.gender}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Phone:</span>
              <span className="font-mono text-slate-900">{patient.phone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-900">{patient.email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Address:</span>
              <span className="text-slate-900 text-right">{patient.address || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Medical Information
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Blood Group:</span>
              <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {patient.bloodGroup || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Allergies:</span>
              <span className="font-semibold text-rose-700">
                {patient.allergies || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Emergency Contact:</span>
              <span className="text-slate-900 font-medium text-right">
                {patient.emergencyContact || 'Not provided'}
              </span>
            </div>
            <div className="py-1">
              <span className="text-slate-500 block mb-1">Clinical Baseline Notes:</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded text-[11px] leading-relaxed">
                {patient.notes || 'No baseline notes recorded.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History Timeline */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Medical History Timeline
        </h3>
        {patientRecords.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">No previous consultations recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {patientRecords.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 group-hover:scale-110 transition-transform" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {item.visitDate}
                    </span>
                    <span className="text-xs text-slate-500">· {item.doctorName}</span>
                  </div>
                  <p className="text-xs font-bold text-indigo-900">Diagnosis: {item.diagnosis}</p>
                  <p className="text-xs text-slate-600">{item.treatment}</p>
                  {item.prescription && (
                    <button
                      onClick={() => setPrintablePrescription(item.prescription || null)}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold flex items-center gap-1 mt-1"
                    >
                      <Printer className="w-3 h-3" />
                      View Issued Prescription ({item.prescription.prescriptionNumber})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Appointment History ({patientAppointments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Appointment Type</th>
                <th className="py-2.5 px-4">Doctor</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {patientAppointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {a.date} ({a.time})
                  </td>
                  <td className="py-3 px-4">{a.type}</td>
                  <td className="py-3 px-4 text-slate-600">{a.doctorName}</td>
                  <td className="py-3 px-4">
                    <Badge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Prescription History ({patientPrescriptions.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Medications</th>
                <th className="py-2.5 px-4">Doctor</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {patientPrescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{rx.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {rx.medicines.map((m, i) => (
                        <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {m.name} ({m.dosage})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{rx.doctorName}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setPrintablePrescription(rx)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
