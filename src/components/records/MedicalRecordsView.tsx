import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { MedicalRecord } from '../../types/clinic';
import {
  Search,
  Plus,
  Eye,
  FileText,
  Printer,
  Calendar,
  User,
  Clock,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const MedicalRecordsView: React.FC = () => {
  const {
    records,
    patients,
    doctors,
    saveConsultation,
    setPrintablePrescription,
    addToast,
    currentUser,
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [diagnosisFilter, setDiagnosisFilter] = useState('All');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // New record form
  const [formData, setFormData] = useState({
    patientId: patients[0]?.id || '',
    doctorId: currentUser?.role === 'doctor' ? currentUser.id : doctors[0]?.id || '',
    visitDate: '2026-09-27',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  const diagnosisList = useMemo(() => {
    const set = new Set(records.map((r) => r.diagnosis));
    return Array.from(set);
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.treatment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDoctor = doctorFilter === 'All' || r.doctorId === doctorFilter;
      const matchesDiagnosis = diagnosisFilter === 'All' || r.diagnosis === diagnosisFilter;

      return matchesSearch && matchesDoctor && matchesDiagnosis;
    });
  }, [records, searchTerm, doctorFilter, diagnosisFilter]);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.diagnosis.trim()) {
      addToast('error', 'Validation Error', 'Please select patient and specify diagnosis.');
      return;
    }
    await saveConsultation({
      ...formData,
    });
    setIsNewRecordModalOpen(false);
  };

  // Get timeline for the patient of the selected record
  const patientTimeline = useMemo(() => {
    if (!selectedRecord) return [];
    return records.filter(
      (r) => r.patientId === selectedRecord.patientId || r.patientName === selectedRecord.patientName
    );
  }, [selectedRecord, records]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, diagnosis, or record…"
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
            <span className="text-xs text-slate-500">Diagnosis:</span>
            <select
              value={diagnosisFilter}
              onChange={(e) => setDiagnosisFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 max-w-[160px] truncate"
            >
              <option value="All">All Diagnoses</option>
              {diagnosisList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsNewRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            + New Medical Record
          </button>
        </div>
      </div>

      {/* Table of Medical Records */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No medical records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Medical records will appear after a patient has completed a clinical consultation.
          </p>
          <button
            onClick={() => setIsNewRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Medical Record
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Visit Date</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Treatment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{rec.patientName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {rec.patientGender ? `${rec.patientGender}, ` : ''}{rec.patientAge ? `${rec.patientAge}y` : ''}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{rec.doctorName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{rec.visitDate}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{rec.diagnosis}</td>
                  <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{rec.treatment}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={rec.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setIsDetailsModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MEDICAL RECORD MODAL */}
      <Modal
        isOpen={isNewRecordModalOpen}
        onClose={() => setIsNewRecordModalOpen(false)}
        title="New Medical Record"
        subtitle="Document clinical consultation findings and treatment plan"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Select Patient <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
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
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Visit Date</label>
            <input
              type="date"
              value={formData.visitDate}
              onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Symptoms</label>
            <textarea
              rows={2}
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="e.g. Fever, headache, chills for 2 days"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Diagnosis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="e.g. Malaria (Plasmodium falciparum)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Treatment Plan</label>
            <textarea
              rows={2}
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="e.g. Prescribed antimalarial combination, bed rest, hydration"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Doctor Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional clinical remarks, follow-up advice..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewRecordModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Save Medical Record
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAILED MEDICAL RECORD MODAL */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Consultation Record Details"
        subtitle="Confidential electronic medical consultation record"
        maxWidth="3xl"
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedRecord.patientName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visit: <span className="font-semibold text-slate-700 font-mono">{selectedRecord.visitDate}</span> · Doctor: <span className="font-semibold text-slate-700">{selectedRecord.doctorName}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={selectedRecord.status} />
                {selectedRecord.prescription && (
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setPrintablePrescription(selectedRecord.prescription || null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Rx
                  </button>
                )}
              </div>
            </div>

            {/* Sections: Symptoms, Diagnosis, Treatment, Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  Symptoms
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedRecord.symptoms || 'None recorded.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  Diagnosis
                </h4>
                <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 text-rose-950 font-semibold text-xs">
                  {selectedRecord.diagnosis}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Treatment
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedRecord.treatment || 'No specific treatment prescribed.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Doctor Notes
                </h4>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedRecord.notes || 'No additional consultation notes.'}
                </p>
              </div>
            </div>

            {/* Associated Prescription */}
            {selectedRecord.prescription && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="font-serif italic text-base text-indigo-600 font-bold">℞</span>
                    Associated Prescription ({selectedRecord.prescription.prescriptionNumber})
                  </h4>
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setPrintablePrescription(selectedRecord.prescription || null);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Open Slip
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                      <tr>
                        <th className="py-2 px-3">Medicine</th>
                        <th className="py-2 px-3">Dosage</th>
                        <th className="py-2 px-3">Frequency</th>
                        <th className="py-2 px-3">Duration</th>
                        <th className="py-2 px-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRecord.prescription.medicines.map((m, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-slate-900">{m.name}</td>
                          <td className="py-2 px-3 font-mono">{m.dosage}</td>
                          <td className="py-2 px-3">{m.frequency}</td>
                          <td className="py-2 px-3">{m.duration}</td>
                          <td className="py-2 px-3 text-slate-600">{m.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Clean Vertical Patient Medical History Timeline */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                Patient Medical History Timeline
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {patientTimeline.map((item, index) => (
                  <div key={item.id} className="relative group">
                    {/* Timeline bullet dot */}
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {item.visitDate}
                        </span>
                        <span className="text-xs text-slate-500">· {item.doctorName}</span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-900 mt-0.5">
                        Diagnosis: {item.diagnosis}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{item.treatment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
