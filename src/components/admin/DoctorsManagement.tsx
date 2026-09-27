import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Doctor } from '../../types/clinic';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const DoctorsManagement: React.FC = () => {
  const { doctors, addDoctor, deleteDoctor, appointments, setCurrentTab, addToast } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: 'General Physician',
    licenseNumber: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    dob: '1985-05-10',
    address: 'Kampala, Uganda',
    password: '',
    confirmPassword: '',
  });

  const specializations = useMemo(() => {
    const set = new Set(doctors.map((d) => d.specialization));
    return Array.from(set);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchesSearch =
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.includes(searchTerm);

      const matchesSpec = specFilter === 'All' || d.specialization === specFilter;
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

      return matchesSearch && matchesSpec && matchesStatus;
    });
  }, [doctors, searchTerm, specFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      specialization: 'General Physician',
      licenseNumber: `MD-UG-${Math.floor(10000 + Math.random() * 90000)}`,
      gender: 'Female',
      dob: '1985-05-10',
      address: 'Kampala, Uganda',
      password: '',
      confirmPassword: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      addToast('error', 'Validation Error', 'Full Name and Email are required.');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      addToast('error', 'Validation Error', 'Passwords do not match.');
      return;
    }

    await addDoctor(formData);
    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoctor) return;
    await deleteDoctor(selectedDoctor.id);
    setIsDeleteModalOpen(false);
    setIsProfileModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctors by name or specialization…"
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Specialization:</span>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Specialties</option>
              {specializations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Add Doctor
          </button>
        </div>
      </div>

      {/* Doctor List: Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Specialization</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Appointments</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredDoctors.map((doc) => {
              const docAppointments = appointments.filter((a) => a.doctorId === doc.id);
              const appointmentCount = doc.appointmentsCount || docAppointments.length || 12;
              return (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.avatar || 'https://images.unsplash.com/photo-1594824813576-928df7764d8a?auto=format&fit=crop&q=80&w=256'}
                        alt={doc.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 block">{doc.fullName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {doc.licenseNumber}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{doc.specialization}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{doc.phone}</td>
                  <td className="py-3.5 px-4 text-slate-600">{doc.email}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-indigo-700">
                    {appointmentCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={doc.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setIsProfileModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="View Doctor Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Doctor Cards: Mobile */}
      <div className="md:hidden space-y-3">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={doc.avatar || 'https://images.unsplash.com/photo-1594824813576-928df7764d8a?auto=format&fit=crop&q=80&w=256'}
                  alt={doc.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{doc.fullName}</h4>
                  <span className="text-xs text-indigo-600 font-medium block">
                    {doc.specialization}
                  </span>
                </div>
              </div>
              <Badge status={doc.status} />
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono">{doc.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span>{doc.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedDoctor(doc);
                  setIsProfileModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  setSelectedDoctor(doc);
                  setIsDeleteModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD DOCTOR MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Doctor"
        subtitle="Register medical practitioner to CarePoint Clinic roster"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Dr. Amina Hassan"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Specialization <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. General Physician, Pediatrician"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@carepoint.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+256 700 123456"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Clinic Office Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Nakasero Lane, Kampala"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Account Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set initial login password"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Create Doctor
            </button>
          </div>
        </form>
      </Modal>

      {/* DOCTOR PROFILE MODAL */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Doctor Profile"
        subtitle="Professional credentials, clinic schedule, and consultation stats"
        maxWidth="3xl"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDoctor.avatar || 'https://images.unsplash.com/photo-1594824813576-928df7764d8a?auto=format&fit=crop&q=80&w=256'}
                  alt={selectedDoctor.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedDoctor.fullName}</h3>
                    <Badge status={selectedDoctor.status} />
                  </div>
                  <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                    {selectedDoctor.specialization}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    License: {selectedDoctor.licenseNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setCurrentTab('appointments');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  View Appointments
                </button>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-xs">
                <span className="text-[11px] text-slate-500 block">Total Consultations</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {selectedDoctor.appointmentsCount || 148}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-xs">
                <span className="text-[11px] text-slate-500 block">Completed Visits</span>
                <span className="text-lg font-bold font-mono text-emerald-600">
                  {selectedDoctor.completedVisitsCount || 136}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-center shadow-xs">
                <span className="text-[11px] text-slate-500 block">Upcoming</span>
                <span className="text-lg font-bold font-mono text-indigo-600">
                  {selectedDoctor.upcomingCount || 12}
                </span>
              </div>
            </div>

            {/* Professional Info & Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Professional details */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Professional Information
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Specialization:</span>
                    <span className="font-semibold text-slate-900">{selectedDoctor.specialization}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">License Number:</span>
                    <span className="font-mono text-slate-900">{selectedDoctor.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-900">{selectedDoctor.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-slate-900">{selectedDoctor.phone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Clinic Office:</span>
                    <span className="text-slate-900 text-right">{selectedDoctor.address}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Schedule */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Clinic Consultation Schedule
                </h4>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(selectedDoctor.schedule || {}).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="text-slate-600 font-medium">{day}:</span>
                      <span className="font-mono text-slate-900">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE DOCTOR CONFIRMATION */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Doctor?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove{' '}
                <span className="font-bold text-slate-900">{selectedDoctor?.fullName}</span> from the
                clinic roster? Deleting this doctor will remove them from future appointment selection.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
