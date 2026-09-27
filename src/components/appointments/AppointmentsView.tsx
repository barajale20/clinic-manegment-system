import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus, AppointmentType } from '../../types/clinic';
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Table as TableIcon,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface AppointmentsViewProps {
  initialPatientId?: string | null;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({ initialPatientId }) => {
  const {
    currentUser,
    appointments,
    patients,
    doctors,
    bookAppointment,
    updateAppointmentStatus,
    startConsultation,
    addToast,
  } = useClinic();

  const isAdmin = currentUser?.role === 'admin';
  const isDoctor = currentUser?.role === 'doctor';

  // Active view: Table or Calendar
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>(isDoctor ? currentUser?.id || 'All' : 'All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Book appointment form state
  const [formData, setFormData] = useState({
    patientId: initialPatientId || (patients[0]?.id ?? ''),
    doctorId: isDoctor ? currentUser?.id || (doctors[0]?.id ?? '') : (doctors[0]?.id ?? ''),
    date: '2026-09-27',
    time: '09:00 AM',
    type: 'General Checkup' as AppointmentType,
    reason: '',
  });

  // Calendar selected month
  const [calendarMonth, setCalendarMonth] = useState('September 2026');

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // If logged in as doctor, default to their appointments unless admin
      if (isDoctor && doctorFilter === 'mine' && a.doctorId !== currentUser?.id) {
        return false;
      }

      const matchesSearch =
        a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.appointmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDoctor = doctorFilter === 'All' || a.doctorId === doctorFilter;
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const matchesType = typeFilter === 'All' || a.type === typeFilter;

      let matchesDate = true;
      const todayStr = '2026-09-27'; // simulated current date
      if (dateFilter === 'today') {
        matchesDate = a.date === todayStr;
      } else if (dateFilter === 'week') {
        matchesDate = a.date >= '2026-09-26' && a.date <= '2026-10-03';
      } else if (dateFilter === 'month') {
        matchesDate = a.date.startsWith('2026-09') || a.date.startsWith('2026-10');
      }

      return matchesSearch && matchesDoctor && matchesStatus && matchesType && matchesDate;
    });
  }, [appointments, searchTerm, doctorFilter, statusFilter, typeFilter, dateFilter, isDoctor, currentUser]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
      addToast('error', 'Validation Error', 'Please complete all required fields.');
      return;
    }
    await bookAppointment(formData);
    setIsBookModalOpen(false);
    setFormData({
      patientId: patients[0]?.id || '',
      doctorId: doctors[0]?.id || '',
      date: '2026-09-27',
      time: '10:00 AM',
      type: 'General Checkup',
      reason: '',
    });
  };

  const handleStatusChange = async (status: AppointmentStatus) => {
    if (!selectedAppointment) return;
    await updateAppointmentStatus(selectedAppointment.id, status);
    setSelectedAppointment({ ...selectedAppointment, status });
  };

  const handleStartConsultation = () => {
    if (!selectedAppointment) return;
    const pat = patients.find(
      (p) => p.id === selectedAppointment.patientId || p.patientId === selectedAppointment.patientId
    );
    if (pat) {
      setIsDetailsModalOpen(false);
      startConsultation(pat, selectedAppointment);
    } else {
      addToast('error', 'Error', 'Patient record not found.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patient or doctor…"
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* View Mode Toggle & Book Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                + Book Appointment
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Date range filter tabs */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                dateFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                dateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                dateFilter === 'week' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                dateFilter === 'month' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isAdmin && (
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option value="All">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="All">All Types</option>
              <option value="General Checkup">General Checkup</option>
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW: TABLE */}
      {viewMode === 'table' ? (
        filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No appointments found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Appointments matching your filter criteria will appear here.
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Book Appointment
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {apt.patientName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{apt.doctorName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{apt.date}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        {apt.time}
                      </td>
                      <td className="py-3.5 px-4">{apt.type}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={apt.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsDetailsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isDoctor && apt.status !== 'Completed' && (
                            <button
                              onClick={() => {
                                const pat = patients.find((p) => p.id === apt.patientId || p.patientId === apt.patientId);
                                if (pat) startConsultation(pat, apt);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors flex items-center gap-1"
                            >
                              <Stethoscope className="w-3 h-3" />
                              Consult
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                        {apt.patientName}
                      </h4>
                      <p className="text-xs text-slate-500">{apt.doctorName}</p>
                    </div>
                    <Badge status={apt.status} />
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">{apt.type}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsDetailsModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      >
                        Details
                      </button>
                      {isDoctor && apt.status !== 'Completed' && (
                        <button
                          onClick={() => {
                            const pat = patients.find((p) => p.id === apt.patientId || p.patientId === apt.patientId);
                            if (pat) startConsultation(pat, apt);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                        >
                          Start Consultation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        /* VIEW: CALENDAR */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              {calendarMonth}
            </h3>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200 text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-slate-50 p-2 font-bold text-slate-600 text-center uppercase tracking-wider text-[11px]">
                {d}
              </div>
            ))}

            {/* Days 21-27 sample calendar week */}
            {[
              { day: 20, isCurrent: false, dateStr: '2026-09-20' },
              { day: 21, isCurrent: true, dateStr: '2026-09-21' },
              { day: 22, isCurrent: true, dateStr: '2026-09-22' },
              { day: 23, isCurrent: true, dateStr: '2026-09-23' },
              { day: 24, isCurrent: true, dateStr: '2026-09-24' },
              { day: 25, isCurrent: true, dateStr: '2026-09-25' },
              { day: 26, isCurrent: true, dateStr: '2026-09-26' },
              { day: 27, isCurrent: true, dateStr: '2026-09-27', isToday: true },
              { day: 28, isCurrent: true, dateStr: '2026-09-28' },
              { day: 29, isCurrent: true, dateStr: '2026-09-29' },
              { day: 30, isCurrent: true, dateStr: '2026-09-30' },
              { day: 1, isCurrent: false, dateStr: '2026-10-01' },
              { day: 2, isCurrent: false, dateStr: '2026-10-02' },
              { day: 3, isCurrent: false, dateStr: '2026-10-03' },
            ].map((cell, idx) => {
              const dayAppointments = appointments.filter((a) => a.date === cell.dateStr);
              return (
                <div
                  key={idx}
                  className={`bg-white min-h-[90px] p-2 flex flex-col justify-between ${
                    cell.isToday ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] font-semibold font-mono rounded-full w-5 h-5 flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white'
                          : cell.isCurrent
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-[10px] text-indigo-600 font-bold font-mono">
                        {dayAppointments.length} apt
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setSelectedAppointment(a);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-[10px] p-1 rounded bg-slate-100 hover:bg-indigo-100 text-slate-800 cursor-pointer truncate transition-colors border border-slate-200/60"
                      >
                        <span className="font-semibold">{a.time}</span> {a.patientName}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <span className="text-[9px] text-slate-500 block text-right font-medium">
                        +{dayAppointments.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BOOK APPOINTMENT MODAL */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Book Appointment"
        subtitle="Schedule a consultation with a CarePoint clinic doctor"
        maxWidth="lg"
      >
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Patient <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientId}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Doctor <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Appointment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Appointment Time <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="08:30 AM">08:30 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Appointment Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as AppointmentType })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="General Checkup">General Checkup</option>
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Reason for Visit</label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Describe main symptoms, reason for consultation..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* APPOINTMENT DETAILS MODAL */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Appointment Details"
        subtitle="Review clinical appointment schedule and update visit status"
        maxWidth="md"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-bold text-indigo-700">
                {selectedAppointment.appointmentId}
              </span>
              <Badge status={selectedAppointment.status} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-900">{selectedAppointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold text-slate-900">{selectedAppointment.doctorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date:</span>
                <span className="font-mono text-slate-900">{selectedAppointment.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Time:</span>
                <span className="font-mono text-slate-900">{selectedAppointment.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-900 font-medium">{selectedAppointment.type}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Reason for Visit:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200/80 leading-relaxed">
                  {selectedAppointment.reason || 'No specific symptoms described.'}
                </p>
              </div>
            </div>

            {/* Actions depending on status */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status Actions
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedAppointment.status !== 'Confirmed' && (
                  <button
                    onClick={() => handleStatusChange('Confirmed')}
                    className="flex-1 py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Confirm
                  </button>
                )}
                {selectedAppointment.status !== 'Completed' && (
                  <button
                    onClick={() => handleStatusChange('Completed')}
                    className="flex-1 py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </button>
                )}
                {selectedAppointment.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange('Cancelled')}
                    className="py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
              </div>

              {isDoctor && selectedAppointment.status !== 'Completed' && (
                <button
                  onClick={handleStartConsultation}
                  className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  Start Patient Consultation
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
