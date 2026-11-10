import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Users,
  UserCheck,
  Calendar,
  CheckCircle2,
  Plus,
  UserPlus,
  CalendarPlus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  XCircle,
  Clock
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface AdminDashboardProps {
  onAddPatient: () => void;
  onAddDoctor: () => void;
  onBookAppointment: () => void;
  onViewPatient: (patientId: string) => void;
  onViewAppointment: (appointmentId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onAddPatient,
  onAddDoctor,
  onBookAppointment,
  onViewPatient,
  onViewAppointment,
}) => {
  const { 
    currentUser,
    patients = [], 
    doctors = [], 
    appointments = [], 
    records = [], 
    setCurrentTab, 
    pendingUsers = [], 
    approveUser, 
    rejectUser 
  } = useClinic() as any;

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // 1. DYNAMIC GREETING BASED ON TIME OF DAY
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const adminName = currentUser?.fullName || currentUser?.name || 'Admin';

  // 2. REAL-TIME DATA CALCULATIONS & FILTERING
  const totalPatientsCount = patients.length;
  const totalDoctorsCount = doctors.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Filter active today's appointments (Excluding cancelled for total count if needed)
  const todaysAppointments = appointments.filter((apt: any) => apt.date === todayStr);
  const activeTodaysAppointments = todaysAppointments.filter((apt: any) => apt.status !== 'Cancelled');
  const todaysAppointmentsList = todaysAppointments.slice(0, 5);

  const completedVisitsCount = records.filter((rec: any) => rec.visitDate === todayStr || rec.status === 'Completed').length;
  const recentPatientsList = patients.slice(0, 4);

  const baseGrowth = totalPatientsCount;
  const chartData = {
    week: [
      { label: 'Mon', value: 20 + Math.floor(baseGrowth * 0.2), completed: 18 },
      { label: 'Tue', value: 25 + Math.floor(baseGrowth * 0.25), completed: 22 },
      { label: 'Wed', value: 30 + Math.floor(baseGrowth * 0.3), completed: 27 },
      { label: 'Thu', value: 28 + Math.floor(baseGrowth * 0.25), completed: 25 },
      { label: 'Fri', value: 35 + Math.floor(baseGrowth * 0.4), completed: 32 },
      { label: 'Sat', value: 18 + Math.floor(baseGrowth * 0.15), completed: 15 },
      { label: 'Sun', value: 10 + Math.floor(baseGrowth * 0.1), completed: 8 },
    ],
    month: [
      { label: 'Week 1', value: 140 + baseGrowth, completed: 125 },
      { label: 'Week 2', value: 160 + baseGrowth, completed: 145 },
      { label: 'Week 3', value: 150 + baseGrowth, completed: 135 },
      { label: 'Week 4', value: 180 + baseGrowth, completed: 165 },
    ],
    year: [
      { label: 'Q1', value: 600 + baseGrowth * 2, completed: 550 },
      { label: 'Q2', value: 680 + baseGrowth * 2, completed: 620 },
      { label: 'Q3', value: 750 + baseGrowth * 3, completed: 690 },
      { label: 'Q4', value: 820 + baseGrowth * 3, completed: 760 },
    ],
  }[timeRange];

  const maxVal = Math.max(...chartData.map((d) => d.value), 10);

  return (
    <div className="space-y-6">
      {/* HEADER WITH DYNAMIC GREETING */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {adminName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here is what is happening across your clinic today.
          </p>
        </div>
      </div>

      {/* QUICK ADMINISTRATIVE ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Quick Administrative Actions</h2>
          <p className="text-xs text-slate-500">Perform common clinic operations instantly</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onAddPatient}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Add Patient
          </button>
          <button
            onClick={onAddDoctor}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add Doctor
          </button>
          <button
            onClick={onBookAppointment}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setCurrentTab('patients')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Total Patients</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {totalPatientsCount.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Registered clinic patients</p>
        </div>

        <div 
          onClick={() => setCurrentTab('doctors')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Total Doctors</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {totalDoctorsCount}
            </span>
            <span className="text-xs text-slate-400">Active roster</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Medical doctors</p>
        </div>

        <div 
          onClick={() => setCurrentTab('appointments')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Today's Appointments</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {activeTodaysAppointments.length}
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
              Active Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {todaysAppointments.length - activeTodaysAppointments.length > 0 
              ? `${todaysAppointments.length - activeTodaysAppointments.length} Cancelled` 
              : 'Appointments scheduled'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Completed Visits</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {completedVisitsCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Recorded</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Medical records</p>
        </div>
      </div>

      {/* PENDING STAFF & RECEPTION APPROVALS SECTION */}
      <div className="bg-amber-50/70 rounded-xl border border-amber-300 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registration Requests</h3>
                <p className="text-xs text-slate-600">Review Doctor, Nurse, Receptionist and other account requests saved in MongoDB</p>
              </div>
            </div>
            <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              {pendingUsers.length} Pending
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-lg border border-amber-200 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">No pending registration requests</p>
              <p className="text-xs text-slate-500 mt-1">New registrations that need your approval will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingUsers.map((user: any) => (
                <div key={user._id || user.id || user.email} className="bg-white p-4 rounded-lg border border-amber-200 shadow-xs flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{user.fullName || user.name || 'Name not provided'}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium uppercase">
                        {user.role || 'Unknown role'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-mono">{user.email}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Submitted: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Date unavailable'}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => approveUser && approveUser(user._id || user.id)}
                      disabled={!user._id && !user.id}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectUser && rejectUser(user._id || user.id)}
                      disabled={!user._id && !user.id}
                      className="flex-1 py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Appointments</h3>
              <p className="text-xs text-slate-500 mt-0.5">Patients scheduled for clinical visits</p>
            </div>
            <button
              onClick={() => setCurrentTab('appointments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              View All Appointments
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {todaysAppointmentsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No appointments scheduled for today.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {todaysAppointmentsList.map((apt: any) => (
                    <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {apt.patientName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{apt.doctorName}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {apt.time}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{apt.type}</td>
                      <td className="py-3 px-4">
                        <Badge status={apt.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onViewAppointment(apt.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Patients</h3>
              <p className="text-xs text-slate-500 mt-0.5">Newly registered clinic patients</p>
            </div>
            <button
              onClick={() => setCurrentTab('patients')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              All
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1">
            {recentPatientsList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No patients registered yet.
              </div>
            ) : (
              recentPatientsList.map((pt: any) => (
                <div
                  key={pt.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {pt.fullName ? pt.fullName.charAt(0) : 'P'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {pt.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">{pt.patientId}</p>
                      <p className="text-[10px] text-slate-400">Reg: {pt.registrationDate}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewPatient(pt.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded transition-colors shrink-0 cursor-pointer"
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};