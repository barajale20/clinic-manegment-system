import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Stethoscope,
  ArrowRight,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface DoctorDashboardProps {
  onStartConsultationForPatient: (patientId: string, appointmentId?: string) => void;
  onViewAppointmentDetails: (appointmentId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  onStartConsultationForPatient,
  onViewAppointmentDetails,
}) => {
  const { currentUser, appointments, patients, setCurrentTab } = useClinic();

  // Filter appointments for this doctor (or all if simulated)
  const doctorAppointments = appointments.filter(
    (a) => !currentUser?.id || a.doctorId === currentUser.id || currentUser.role === 'doctor'
  );

  const todaysAppointments = doctorAppointments.filter((a) => a.date === '2026-09-27' || a.date === '2026-09-26');
  const upcomingAppointments = doctorAppointments.slice(0, 5);
  const recentPatients = patients.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Today's Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900">12</span>
          <p className="text-xs text-slate-500 mt-1">Scheduled clinical visits</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Pending Consultations</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-amber-700">4</span>
          <p className="text-xs text-slate-500 mt-1">Awaiting review today</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Completed Visits</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-600">7</span>
          <p className="text-xs text-slate-500 mt-1">Completed today</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Patients</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900">248</span>
          <p className="text-xs text-slate-500 mt-1">Under your clinical care</p>
        </div>
      </div>

      {/* Quick Actions (Doctor scoped only!) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Clinical Quick Actions
          </h3>
          <p className="text-xs text-slate-500">Fast access to patient records and schedule</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setCurrentTab('appointments')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            View Appointments
          </button>
          <button
            onClick={() => setCurrentTab('patients')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            View Patients
          </button>
          <button
            onClick={() => setCurrentTab('consultation')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Start Consultation
          </button>
        </div>
      </div>

      {/* 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments List (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Appointments</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your schedule for clinical consultations</p>
            </div>
            <button
              onClick={() => setCurrentTab('appointments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
            >
              All Schedule
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Appointment Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {todaysAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{apt.time}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{apt.patientName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{apt.patientPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">{apt.type}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={apt.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewAppointmentDetails(apt.id)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                        >
                          View
                        </button>
                        {apt.status !== 'Completed' && (
                          <button
                            onClick={() => onStartConsultationForPatient(apt.patientId, apt.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Stethoscope className="w-3 h-3" />
                            Start Consultation
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Upcoming Appointments & Recent Patients */}
        <div className="space-y-6">
          {/* Upcoming Appointments Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Appointments</h3>
            <div className="divide-y divide-slate-100">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block">{apt.patientName}</span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {apt.date} · {apt.time}
                    </span>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Patients Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Patients</h3>
            <div className="divide-y divide-slate-100">
              {recentPatients.map((pt) => (
                <div
                  key={pt.id}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {pt.fullName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">{pt.fullName}</span>
                      <span className="text-slate-400 text-[11px] font-mono">{pt.patientId}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onStartConsultationForPatient(pt.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Consult
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
