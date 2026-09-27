import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface AccessDeniedGuardProps {
  requiredRole: 'admin' | 'doctor';
  resourceName: string;
}

export const AccessDeniedGuard: React.FC<AccessDeniedGuardProps> = ({
  requiredRole,
  resourceName,
}) => {
  const { currentUser, setCurrentTab } = useClinic();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center max-w-lg mx-auto my-12">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        The requested feature <strong className="text-slate-800">“{resourceName}”</strong> requires{' '}
        <span className="font-semibold text-slate-900 capitalize">{requiredRole}</span> role authorization.
        Your current session is authenticated as{' '}
        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-100 text-slate-700">
          {currentUser?.role}
        </span>
        .
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to My Dashboard
        </button>
      </div>
    </div>
  );
};
