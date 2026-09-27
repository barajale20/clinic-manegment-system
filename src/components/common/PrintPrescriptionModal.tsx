import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Printer, Download, X, HeartPulse } from 'lucide-react';
import { Prescription } from '../../types/clinic';

interface PrintPrescriptionModalProps {
  prescription: Prescription | null;
  onClose: () => void;
}

export const PrintPrescriptionModal: React.FC<PrintPrescriptionModalProps> = ({
  prescription,
  onClose,
}) => {
  const { settings, addToast } = useClinic();

  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    addToast('info', 'Download Started', 'Preparing PDF prescription document...');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity no-print"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 z-10 flex flex-col">
        {/* Actions Bar (hidden in print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide">Prescription Slip</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {prescription.prescriptionNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="printable-prescription" className="p-8 sm:p-10 bg-white text-slate-900">
          {/* Clinic Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                  {settings.clinicName}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Primary Healthcare & Specialized Medical Center
                </p>
                <p className="text-xs text-slate-500">
                  {settings.address} · {settings.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Official Rx Record
              </span>
              <p className="font-mono text-sm font-bold text-indigo-700 mt-0.5">
                {prescription.prescriptionNumber}
              </p>
              <p className="text-xs text-slate-600 mt-1">Date: {prescription.date}</p>
            </div>
          </div>

          {/* Patient & Doctor Meta */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Patient Name
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{prescription.patientName}</p>
              <span className="text-xs text-slate-500 font-mono">ID: {prescription.patientId}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Prescribing Doctor
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{prescription.doctorName}</p>
              <span className="text-xs text-slate-500">CarePoint Medical Staff</span>
            </div>
          </div>

          {/* Medicine Table */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-serif italic text-2xl font-bold text-indigo-600">℞</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescribed Medications
              </h3>
            </div>

            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 text-xs font-semibold">
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {prescription.medicines.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-semibold text-slate-900">{med.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{med.dosage}</td>
                    <td className="py-3 px-3 text-slate-700">{med.frequency}</td>
                    <td className="py-3 px-3 text-slate-700">{med.duration}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* General Instructions */}
          {prescription.instructions && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3.5 mb-8">
              <span className="text-xs font-bold text-amber-900 block mb-0.5">
                Patient Instructions:
              </span>
              <p className="text-xs text-amber-800 leading-relaxed">{prescription.instructions}</p>
            </div>
          )}

          {/* Doctor Signature & Clinic Footer */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between">
            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">{settings.clinicName}</p>
              <p>{settings.email} · {settings.phone}</p>
              <p>Clinic Hours: {settings.openingTime} – {settings.closingTime}</p>
            </div>

            <div className="text-center min-w-[200px]">
              <div className="border-b border-slate-400 pb-1 mb-1 font-serif text-slate-800 italic text-base">
                {prescription.doctorName}
              </div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Authorized Signature
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
