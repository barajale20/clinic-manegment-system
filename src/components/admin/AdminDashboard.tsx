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
  const { patients, doctors, appointments, setCurrentTab } = useClinic();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Realistic counts
  const totalPatientsCount = 1248 + (patients.length - 6);
  const totalDoctorsCount = 18 + (doctors.length - 3);
  const todaysAppointmentsList = appointments.slice(0, 5);
  const recentPatientsList = patients.slice(0, 4);

  // Chart data points based on time range
  const chartData = {
    week: [
      { label: 'Mon', value: 24, completed: 20 },
      { label: 'Tue', value: 28, completed: 25 },
      { label: 'Wed', value: 35, completed: 30 },
      { label: 'Thu', value: 31, completed: 28 },
      { label: 'Fri', value: 38, completed: 34 },
      { label: 'Sat', value: 22, completed: 19 },
      { label: 'Sun', value: 12, completed: 11 },
    ],
    month: [
      { label: 'Week 1', value: 160, completed: 142 },
      { label: 'Week 2', value: 185, completed: 168 },
      { label: 'Week 3', value: 172, completed: 155 },
      { label: 'Week 4', value: 198, completed: 180 },
    ],
    year: [
      { label: 'Q1', value: 680, completed: 620 },
      { label: 'Q2', value: 740, completed: 690 },
      { label: 'Q3', value: 810, completed: 760 },
      { label: 'Q4', value: 890, completed: 835 },
    ],
  }[timeRange];

  const maxVal = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* Quick Actions Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Quick Administrative Actions</h2>
          <p className="text-xs text-slate-500">Perform common clinic operations instantly</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onAddPatient}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Add Patient
          </button>
          <button
            onClick={onAddDoctor}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add Doctor
          </button>
          <button
            onClick={onBookAppointment}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-xs"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
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
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Registered patients</p>
        </div>

        {/* Total Doctors */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
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
            <span className="text-xs text-slate-400">All departments</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Active doctors</p>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Today's Appointments</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">32</span>
            <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
              4 pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Appointments today</p>
        </div>

        {/* Completed Visits */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Completed Visits</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">24</span>
            <span className="text-xs text-emerald-600 font-medium">75% target</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Completed today</p>
        </div>
      </div>

      {/* Main Grid: Today's Appointments + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Appointments</h3>
              <p className="text-xs text-slate-500 mt-0.5">Patients scheduled for clinical visits</p>
            </div>
            <button
              onClick={() => setCurrentTab('appointments')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
            >
              View All Appointments
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
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
                {todaysAppointmentsList.map((apt) => (
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
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Patients Card (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Patients</h3>
              <p className="text-xs text-slate-500 mt-0.5">Newly registered clinic patients</p>
            </div>
            <button
              onClick={() => setCurrentTab('patients')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              All
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1">
            {recentPatientsList.map((pt) => (
              <div
                key={pt.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {pt.fullName.charAt(0)}
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
                  className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded transition-colors shrink-0"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Chart Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Appointments Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled vs completed clinical visit trends
            </p>
          </div>

          {/* Time range selector tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === 'week'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === 'month'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === 'year'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Year
            </button>
          </div>
        </div>

        {/* Clean visual bar chart with Legend */}
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-600" />
              <span className="text-slate-600">Total Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span className="text-slate-600">Completed Visits</span>
            </div>
          </div>

          <div className="grid grid-flow-col auto-cols-fr gap-3 sm:gap-6 items-end h-44 pt-4 border-b border-slate-200">
            {chartData.map((d, i) => {
              const heightPercent = Math.round((d.value / maxVal) * 100);
              const completedPercent = Math.round((d.completed / maxVal) * 100);
              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-full">
                    {/* Booked bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-1/2 bg-indigo-600/90 rounded-t group-hover:bg-indigo-700 transition-all relative flex justify-center"
                      title={`Booked: ${d.value}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 text-[10px] font-mono font-bold text-slate-700 bg-white px-1 rounded shadow-xs border transition-opacity">
                        {d.value}
                      </span>
                    </div>
                    {/* Completed bar */}
                    <div
                      style={{ height: `${completedPercent}%` }}
                      className="w-1/2 bg-emerald-500 rounded-t group-hover:bg-emerald-600 transition-all relative flex justify-center"
                      title={`Completed: ${d.completed}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 text-[10px] font-mono font-bold text-slate-700 bg-white px-1 rounded shadow-xs border transition-opacity">
                        {d.completed}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
