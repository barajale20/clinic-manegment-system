import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Bell, Menu, Check } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  title,
  subtitle,
  actions,
}) => {
  const { currentUser, appointments } = useClinic();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Recent 3 appointments as notification alerts
  const recentNotifications = appointments.slice(0, 3).map((a) => ({
    id: a.id,
    title: `Appointment ${a.status}`,
    desc: `${a.patientName} with ${a.doctorName} at ${a.time}`,
    time: 'Today',
  }));

  return (
    <header className="h-16 px-4 sm:px-8 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30 no-print">
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 font-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Actions + Notifications + Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">Notifications</span>
                  <span className="text-[11px] text-indigo-600 font-medium cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {recentNotifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 leading-tight">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {n.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Pill & Role Tag */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'}
            alt={currentUser?.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-slate-900 block leading-tight">
              {currentUser?.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                  currentUser?.role === 'admin'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                }`}
              >
                {currentUser?.role === 'admin' ? 'Administrator' : `Doctor • ${currentUser?.specialization || 'Clinical'}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
