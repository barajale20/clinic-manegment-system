import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Prescription, PrescriptionItem } from '../../types/clinic';
import {
  Search,
  Plus,
  Printer,
  Trash2,
  Pill,
  Calendar,
  User,
  Clock,
  PlusCircle,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const PrescriptionsView: React.FC = () => {
  const {
    prescriptions,
    patients,
    doctors,
    createPrescription,
    setPrintablePrescription,
    addToast,
    currentUser,
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New prescription form state
  const [formPatientId, setFormPatientId] = useState(patients[0]?.id || '');
  const [formDoctorId, setFormDoctorId] = useState(
    currentUser?.role === 'doctor' ? currentUser.id : doctors[0]?.id || ''
  );
  const [formDate, setFormDate] = useState('2026-09-27');
  const [formInstructions, setFormInstructions] = useState('Take medication after meals.');
  const [medicines, setMedicines] = useState<Omit<PrescriptionItem, 'id'>[]>([
    {
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: '3 times daily',
      duration: '5 days',
      instructions: 'After meals',
    },
  ]);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const medicineNames = rx.medicines.map((m) => m.name).join(' ');
      const matchesSearch =
        rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicineNames.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDoctor = doctorFilter === 'All' || rx.doctorId === doctorFilter;
      const matchesStatus = statusFilter === 'All' || rx.status === statusFilter;

      return matchesSearch && matchesDoctor && matchesStatus;
    });
  }, [prescriptions, searchTerm, doctorFilter, statusFilter]);

  const handleAddMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after meals',
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (medicines.length === 1) {
      addToast('warning', 'Notice', 'At least one medicine is required.');
      return;
    }
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleUpdateMedicineRow = (
    index: number,
    field: keyof Omit<PrescriptionItem, 'id'>,
    value: string
  ) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientId) {
      addToast('error', 'Validation Error', 'Please select a patient.');
      return;
    }
    const validMedicines = medicines.filter((m) => m.name.trim() !== '');
    if (validMedicines.length === 0) {
      addToast('error', 'Validation Error', 'Please specify at least one medicine name.');
      return;
    }

    const newRx = await createPrescription({
      patientId: formPatientId,
      doctorId: formDoctorId,
      date: formDate,
      instructions: formInstructions,
      medicines: validMedicines.map((m, idx) => ({ id: `m-${Date.now()}-${idx}`, ...m })),
      status: 'Active',
    });

    setIsCreateModalOpen(false);
    // Optionally open the print view immediately
    setPrintablePrescription(newRx);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, doctor, or medication…"
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Doctor:</span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="All">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Create Prescription
          </button>
        </div>
      </div>

      {/* Prescriptions Table */}
      {filteredPrescriptions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No prescriptions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Prescriptions created during consultations will appear here.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Prescription
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Rx Number</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Medications</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPrescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                    {rx.prescriptionNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{rx.patientName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{rx.doctorName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{rx.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {rx.medicines.map((m, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {m.name} ({m.dosage})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={rx.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setPrintablePrescription(rx)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE PRESCRIPTION MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Prescription"
        subtitle="Issue official patient medication prescription"
        maxWidth="3xl"
      >
        <form onSubmit={handleSavePrescription} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Patient <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formPatientId}
                onChange={(e) => setFormPatientId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Doctor <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formDoctorId}
                onChange={(e) => setFormDoctorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Medicines Dynamic Builder */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescribed Medicines
              </span>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center relative"
                >
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Medicine Name</label>
                    <input
                      type="text"
                      required
                      value={med.name}
                      onChange={(e) => handleUpdateMedicineRow(index, 'name', e.target.value)}
                      placeholder="e.g. Paracetamol"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleUpdateMedicineRow(index, 'dosage', e.target.value)}
                      placeholder="500mg"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Frequency</label>
                    <select
                      value={med.frequency}
                      onChange={(e) => handleUpdateMedicineRow(index, 'frequency', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded"
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="3 times daily">3 times daily</option>
                      <option value="4 times daily">4 times daily</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleUpdateMedicineRow(index, 'duration', e.target.value)}
                      placeholder="5 days"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Instructions</label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedicineRow(index, 'instructions', e.target.value)}
                      placeholder="After meals"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicineRow(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              General Patient Instructions
            </label>
            <textarea
              rows={2}
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              placeholder="e.g. Take medication after meals. Drink adequate fluids and avoid alcohol."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Save Prescription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
