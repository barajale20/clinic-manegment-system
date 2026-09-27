import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient, PrescriptionItem, MedicalRecord, Prescription } from '../../types/clinic';
import {
  Stethoscope,
  HeartPulse,
  Activity,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Printer,
  Calendar,
  Clock,
  ArrowLeft,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

interface ConsultationWorkflowProps {
  onBackToAppointments: () => void;
}

export const ConsultationWorkflow: React.FC<ConsultationWorkflowProps> = ({
  onBackToAppointments,
}) => {
  const {
    currentUser,
    patients,
    records,
    selectedPatientForConsultation,
    selectedAppointmentForConsultation,
    saveConsultation,
    setPrintablePrescription,
    clearConsultation,
    addToast,
  } = useClinic();

  // If no patient was explicitly selected, default to Ahmed Hassan (pat-1) or first patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    selectedPatientForConsultation?.id || patients[0]?.id || ''
  );

  const activePatient: Patient | undefined = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId || p.patientId === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Previous records for this patient
  const patientRecords = useMemo(() => {
    if (!activePatient) return [];
    return records.filter(
      (r) => r.patientId === activePatient.id || r.patientId === activePatient.patientId
    );
  }, [records, activePatient]);

  const lastRecord = patientRecords[0];

  // Consultation Form State
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [visitDate] = useState('2026-09-27');

  // Dynamic Prescription List
  const [medicines, setMedicines] = useState<Omit<PrescriptionItem, 'id'>[]>([
    {
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: '3 times daily',
      duration: '5 days',
      instructions: 'Take after meals',
    },
    {
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '2 times daily',
      duration: '7 days',
      instructions: 'Complete full course',
    },
  ]);
  const [prescriptionInstructions, setPrescriptionInstructions] = useState(
    'Take medication after meals.'
  );

  // Workflow states: 'consulting' | 'saving' | 'completed'
  const [workflowState, setWorkflowState] = useState<'consulting' | 'saving' | 'completed'>('consulting');
  const [savedResult, setSavedResult] = useState<{
    record: MedicalRecord;
    prescription?: Prescription;
  } | null>(null);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '500mg',
        frequency: '3 times daily',
        duration: '5 days',
        instructions: 'After meals',
      },
    ]);
  };

  const handleRemoveMedicine = (idx: number) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleUpdateMedicine = (
    index: number,
    field: keyof Omit<PrescriptionItem, 'id'>,
    val: string
  ) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: val };
    setMedicines(updated);
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      addToast('error', 'Error', 'No patient selected.');
      return;
    }
    if (!diagnosis.trim()) {
      addToast('error', 'Validation Error', 'Diagnosis is required.');
      return;
    }

    setWorkflowState('saving');
    try {
      const validMedicines = medicines.filter((m) => m.name.trim() !== '');
      const result = await saveConsultation({
        patientId: activePatient.id,
        doctorId: currentUser?.id || 'doc-amina',
        visitDate,
        symptoms: symptoms.trim() || 'General weakness and fever reported.',
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim() || 'Prescribed oral medication and adequate hydration.',
        notes: doctorNotes.trim(),
        medicines: validMedicines,
        prescriptionInstructions,
        appointmentId: selectedAppointmentForConsultation?.id,
      });

      setSavedResult(result);
      setWorkflowState('completed');
    } catch {
      setWorkflowState('consulting');
      addToast('error', 'Error', 'Failed to save consultation.');
    }
  };

  const handleResetForm = () => {
    setSymptoms('');
    setDiagnosis('');
    setTreatment('');
    setDoctorNotes('');
    setMedicines([]);
    setWorkflowState('consulting');
    setSavedResult(null);
    clearConsultation();
    onBackToAppointments();
  };

  if (!activePatient) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">No Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Please select an appointment or patient from your dashboard to start consultation.
        </p>
        <button
          onClick={onBackToAppointments}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          View Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consultation Page Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-700">
              <Stethoscope className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Patient Consultation</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-600 mt-1 font-mono">
            <span>
              Patient: <strong className="text-slate-900 font-sans">{activePatient.fullName}</strong>
            </span>
            <span>·</span>
            <span>
              ID: <strong className="text-indigo-700">{activePatient.patientId}</strong>
            </span>
            <span>·</span>
            <span>
              {activePatient.age} yrs ({activePatient.gender})
            </span>
            <span>·</span>
            <span>
              Date: <strong className="text-slate-800">{visitDate}</strong>
            </span>
          </div>
        </div>

        {/* Change Patient selector if needed */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 hidden sm:inline">Switch Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            disabled={workflowState === 'completed'}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.patientId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STATE: COMPLETED SUMMARY SCREEN */}
      {workflowState === 'completed' && savedResult ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 max-w-2xl mx-auto space-y-6 animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Consultation Completed
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Clinical record and electronic prescription saved successfully to patient chart.
            </p>
          </div>

          {/* Consultation Summary Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-900">{activePatient.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Diagnosis:</span>
              <span className="font-semibold text-rose-900 bg-rose-50 px-2 py-0.5 rounded">
                {savedResult.record.diagnosis}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Treatment Plan:</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">
                {savedResult.record.treatment}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Prescription:</span>
              <span className="font-semibold text-indigo-700">
                {savedResult.prescription
                  ? `${savedResult.prescription.medicines.length} medicines prescribed (${savedResult.prescription.prescriptionNumber})`
                  : 'No medicines prescribed'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {savedResult.prescription && (
              <button
                onClick={() => setPrintablePrescription(savedResult.prescription || null)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Prescription Slip
              </button>
            )}

            <button
              onClick={handleResetForm}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Back to Appointments
            </button>
          </div>
        </div>
      ) : (
        /* STATE: ACTIVE CONSULTATION (2-COLUMN DESKTOP / 1-COLUMN MOBILE) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Patient Summary + Previous Medical Records (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Compact Patient Summary Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-indigo-600" />
                Patient Clinical Summary
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Blood Group
                  </span>
                  <span className="font-bold text-indigo-700 font-mono text-sm">
                    {activePatient.bloodGroup || 'O+'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Allergies
                  </span>
                  <span className="font-bold text-rose-700 text-xs truncate block">
                    {activePatient.allergies || 'None reported'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Previous Visits
                  </span>
                  <span className="font-bold font-mono text-slate-800">
                    {patientRecords.length} visits
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Last Diagnosis
                  </span>
                  <span className="font-bold text-slate-800 text-xs truncate block">
                    {lastRecord ? lastRecord.diagnosis : 'None on record'}
                  </span>
                </div>
              </div>

              {activePatient.notes && (
                <div className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
                  <span className="text-[11px] font-bold text-amber-900 block mb-0.5">
                    Patient Note:
                  </span>
                  {activePatient.notes}
                </div>
              )}
            </div>

            {/* Previous Medical Records Timeline */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Previous Consultation Records
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {patientRecords.length} recorded
                </span>
              </div>

              {patientRecords.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No previous clinical records.</p>
              ) : (
                <div className="space-y-3">
                  {patientRecords.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800">{r.visitDate}</span>
                        <span className="text-slate-500">{r.doctorName}</span>
                      </div>
                      <p className="font-bold text-indigo-900">Diagnosis: {r.diagnosis}</p>
                      {r.symptoms && (
                        <p className="text-slate-600 text-[11px]">Symptoms: {r.symptoms}</p>
                      )}
                      {r.treatment && (
                        <p className="text-slate-600 text-[11px]">Treatment: {r.treatment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Current Consultation Form (7 Columns) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">New Consultation Record</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Step-by-step clinical evaluation and medication prescription
              </p>
            </div>

            <form onSubmit={handleSaveConsultation} className="space-y-4">
              {/* 1. Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  1. Patient Symptoms
                </label>
                <textarea
                  rows={2}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe patient's symptoms (e.g. Fever, headache and body weakness)..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>

              {/* 2. Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  2. Clinical Diagnosis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis (e.g. Malaria, Acute Bronchitis, Hypertension)..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors font-medium"
                />
              </div>

              {/* 3. Treatment */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  3. Recommended Treatment Plan
                </label>
                <textarea
                  rows={2}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Enter recommended treatment (e.g. Prescribed medication, hydration, and 3 days of rest)..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>

              {/* 4. Doctor Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  4. Doctor Consultation Notes
                </label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Additional observations, laboratory follow-up schedule, dietary advice..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>

              {/* 5. Prescription Section */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="font-serif italic font-bold text-indigo-600 text-sm">℞</span>
                      5. Prescription & Medications
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Add medications with explicit dosage and administration directions
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Add Medicine
                  </button>
                </div>

                {medicines.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    No medications added yet. Click "+ Add Medicine" to prescribe drugs.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {medicines.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 block mb-0.5">Medicine</label>
                          <input
                            type="text"
                            required
                            value={m.name}
                            onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                            placeholder="e.g. Paracetamol"
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 block mb-0.5">Dosage</label>
                          <input
                            type="text"
                            value={m.dosage}
                            onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                            placeholder="500mg"
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 block mb-0.5">Frequency</label>
                          <select
                            value={m.frequency}
                            onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          >
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="3 times daily">3 times daily</option>
                            <option value="4 times daily">4 times daily</option>
                            <option value="As needed">As needed</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 block mb-0.5">Duration</label>
                          <input
                            type="text"
                            value={m.duration}
                            onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                            placeholder="5 days"
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Special Medication Instructions
                  </label>
                  <input
                    type="text"
                    value={prescriptionInstructions}
                    onChange={(e) => setPrescriptionInstructions(e.target.value)}
                    placeholder="e.g. Take medication after meals with plenty of water."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onBackToAppointments}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={workflowState === 'saving'}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                  {workflowState === 'saving' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      Save Consultation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
