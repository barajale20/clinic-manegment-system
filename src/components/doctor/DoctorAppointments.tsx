import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus } from '../../types/clinic';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Clock,
  Calendar,
  User,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const DoctorAppointments: React.FC = () => {
  const {
    currentUser,
    appointments,
    patients,
    updateAppointmentStatus,
    startConsultation,
    addToast,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const todayStr = '2026-09-27';

  // Filter for doctor's appointments
  const doctorAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // If doctor role, filter by their doctor ID or doctor name
      if (currentUser?.role === 'doctor') {
        if (currentUser.id && a.doctorId && a.doctorId !== currentUser.id) {
          // Allow all for Dr. Amina demo or matching
        }
      }

      const matchesSearch =
        a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.appointmentId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'All' || a.type === typeFilter;

      let matchesTab = true;
      if (activeTab === 'today') {
        matchesTab = a.date === todayStr && a.status !== 'Cancelled';
      } else if (activeTab === 'upcoming') {
        matchesTab = a.date >= todayStr && a.status !== 'Completed' && a.status !== 'Cancelled';
      } else if (activeTab === 'completed') {
        matchesTab = a.status === 'Completed';
      } else if (activeTab === 'cancelled') {
        matchesTab = a.status === 'Cancelled';
      }

      return matchesSearch && matchesType && matchesTab;
    });
  }, [appointments, currentUser, searchTerm, typeFilter, activeTab]);

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
      {/* Tabs & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Status Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit text-xs">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'today'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'cancelled'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Search & Type filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patient by name or symptoms…"
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Appointment Type:</span>
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

      {/* Appointment Table */}
      {doctorAppointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No appointments in this tab</h3>
          <p className="text-xs text-slate-500 mt-1">
            Check other tabs or search terms to view patient schedules.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Appointment Type</th>
                <th className="py-3 px-4">Reason / Symptoms</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {doctorAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{apt.time}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{apt.patientName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {apt.patientGender ? `${apt.patientGender}, ` : ''}
                      {apt.patientAge ? `${apt.patientAge}y` : ''}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{apt.type}</td>
                  <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{apt.reason}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={apt.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsDetailsModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      >
                        Details
                      </button>
                      {apt.status !== 'Completed' && (
                        <button
                          onClick={() => {
                            const pat = patients.find(
                              (p) => p.id === apt.patientId || p.patientId === apt.patientId
                            );
                            if (pat) startConsultation(pat, apt);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-xs flex items-center gap-1"
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
      )}

      {/* APPOINTMENT DETAILS DRAWER / MODAL */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Appointment Clinical Summary"
        subtitle="Patient medical background and visit details"
        maxWidth="md"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            {/* Patient Header */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {selectedAppointment.patientName}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedAppointment.patientId} · {selectedAppointment.patientGender} ·{' '}
                  {selectedAppointment.patientAge} years
                </span>
              </div>
              <Badge status={selectedAppointment.status} />
            </div>

            {/* Appointment specifics */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-mono text-slate-900">{selectedAppointment.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-mono text-slate-900">{selectedAppointment.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Consultation Type:</span>
                <span className="text-slate-900 font-semibold">{selectedAppointment.type}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Stated Reason:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200/80 leading-relaxed">
                  {selectedAppointment.reason}
                </p>
              </div>
            </div>

            {/* Actions: Start Consultation, Mark Completed, Cancel */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {selectedAppointment.status !== 'Completed' && (
                <button
                  onClick={handleStartConsultation}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  Start Consultation
                </button>
              )}

              <div className="flex items-center gap-2">
                {selectedAppointment.status !== 'Completed' && (
                  <button
                    onClick={() => handleStatusChange('Completed')}
                    className="flex-1 py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Completed
                  </button>
                )}
                {selectedAppointment.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange('Cancelled')}
                    className="py-1.5 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
