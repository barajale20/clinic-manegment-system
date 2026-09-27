import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  Settings as SettingsIcon,
  LogOut,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentUser, currentTab, setCurrentTab, logout } = useClinic();

  const isAdmin = currentUser?.role === 'admin';

  // Strict Admin Navigation: only admin-allowed pages
  const adminNav = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients Management', icon: Users },
    { id: 'doctors', label: 'Doctors Directory', icon: UserCheck },
    { id: 'appointments', label: 'Clinic Appointments', icon: Calendar },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'settings', label: 'Clinic Settings', icon: SettingsIcon },
  ];

  // Strict Doctor Navigation: only doctor-allowed pages
  const doctorNav = [
    { id: 'dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'consultation', label: 'Patient Consultation', icon: Stethoscope },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'records', label: 'Clinical Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions Issued', icon: Pill },
  ];

  const navItems = isAdmin ? adminNav : doctorNav;

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                CarePoint
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Clinic System
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Authenticated Role Badge (No switching) */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          {isAdmin ? (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-indigo-50/80 border border-indigo-100/80">
              <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block leading-tight">
                  Admin Portal
                </span>
                <span className="text-[11px] font-medium text-slate-600 truncate block">
                  Full System Control
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-50/80 border border-emerald-100/80">
              <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block leading-tight">
                  Doctor Portal
                </span>
                <span className="text-[11px] font-medium text-slate-600 truncate block">
                  Clinical & Patient Care
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {isAdmin ? 'Administration Menu' : 'Clinical Practice'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'consultation' && !isAdmin && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200/80 mb-2">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {currentUser?.name}
              </p>
              <p className="text-[11px] text-slate-500 capitalize truncate">
                {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.specialization || 'Doctor'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

