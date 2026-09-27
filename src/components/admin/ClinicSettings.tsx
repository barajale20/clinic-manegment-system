import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Building2,
  User,
  KeyRound,
  CalendarClock,
  Bell,
  Sliders,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const ClinicSettings: React.FC = () => {
  const { settings, updateSettings, currentUser, addToast } = useClinic();

  const [activeTab, setActiveTab] = useState<
    'clinic' | 'admin' | 'password' | 'appointment' | 'notifications' | 'preferences'
  >('clinic');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [clinicForm, setClinicForm] = useState({
    clinicName: settings.clinicName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    description: settings.description,
  });

  const [adminProfileForm, setAdminProfileForm] = useState({
    name: currentUser?.name || 'Sarah Nambi',
    email: currentUser?.email || 'admin@carepoint.com',
    phone: currentUser?.phone || '+256 700 000001',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [appointmentSettings, setAppointmentSettings] = useState({
    defaultDuration: settings.defaultAppointmentDuration || 30,
    workingDays: settings.workingDays || [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    openingTime: settings.openingTime || '08:00 AM',
    closingTime: settings.closingTime || '05:00 PM',
  });

  const [notifications, setNotifications] = useState({
    appointmentReminders: settings.appointmentReminders,
    newAppointmentNotifications: settings.newAppointmentNotifications,
    systemNotifications: settings.systemNotifications,
  });

  const [preferences, setPreferences] = useState({
    language: settings.language || 'English',
    dateFormat: settings.dateFormat || 'DD/MM/YYYY',
    theme: settings.theme || 'Light',
  });

  const triggerSave = async (callback: () => Promise<void>) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await callback();
      setSaveSuccess(true);
      addToast('success', 'Saved', 'Settings updated successfully.');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      addToast('error', 'Error', 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSave(async () => {
      await updateSettings(clinicForm);
    });
  };

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSave(async () => {
      // Simulate profile update
      await new Promise((r) => setTimeout(r, 400));
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      addToast('error', 'Error', 'Please fill in current and new password.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('error', 'Error', 'New passwords do not match.');
      return;
    }
    triggerSave(async () => {
      await new Promise((r) => setTimeout(r, 400));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    });
  };

  const handleSaveAppointmentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSave(async () => {
      await updateSettings({
        defaultAppointmentDuration: appointmentSettings.defaultDuration,
        workingDays: appointmentSettings.workingDays,
        openingTime: appointmentSettings.openingTime,
        closingTime: appointmentSettings.closingTime,
      });
    });
  };

  const handleSaveNotifications = () => {
    triggerSave(async () => {
      await updateSettings(notifications);
    });
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSave(async () => {
      await updateSettings(preferences);
    });
  };

  const toggleDay = (day: string) => {
    const current = appointmentSettings.workingDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setAppointmentSettings({ ...appointmentSettings, workingDays: updated });
  };

  const navItems = [
    { id: 'clinic', label: 'Clinic Profile', icon: Building2 },
    { id: 'admin', label: 'Admin Profile', icon: User },
    { id: 'password', label: 'Change Password', icon: KeyRound },
    { id: 'appointment', label: 'Appointment Settings', icon: CalendarClock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'System Preferences', icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      {/* Settings Container: Left Nav + Content Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Left-side Navigation (Desktop) / Tabs (Mobile) */}
        <div className="md:col-span-4 lg:col-span-3 border-b md:border-b-0 md:border-r border-slate-100 p-4 bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-3 hidden md:block">
            Settings Menu
          </h3>
          <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSaveSuccess(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-8 lg:col-span-9 p-6">
          {saveSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings updated successfully.</span>
            </div>
          )}

          {/* 1. CLINIC PROFILE */}
          {activeTab === 'clinic' && (
            <form onSubmit={handleSaveClinic} className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Clinic Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update primary healthcare facility contact details and metadata
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicForm.clinicName}
                    onChange={(e) => setClinicForm({ ...clinicForm, clinicName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={clinicForm.phone}
                      onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={clinicForm.email}
                      onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={clinicForm.address}
                    onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Clinic Description
                  </label>
                  <textarea
                    rows={3}
                    value={clinicForm.description}
                    onChange={(e) => setClinicForm({ ...clinicForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* 2. ADMIN PROFILE */}
          {activeTab === 'admin' && (
            <form onSubmit={handleSaveAdminProfile} className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Admin Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage administrator credentials and display details
                </p>
              </div>

              <div className="flex items-center gap-4 py-2">
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
                  }
                  alt="Admin"
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                />
                <div>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Change Photo
                  </button>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    JPG or PNG under 2MB
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={adminProfileForm.name}
                    onChange={(e) =>
                      setAdminProfileForm({ ...adminProfileForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={adminProfileForm.email}
                      onChange={(e) =>
                        setAdminProfileForm({ ...adminProfileForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={adminProfileForm.phone}
                      onChange={(e) =>
                        setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          )}

          {/* 3. CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your security credentials for portal access
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {saving ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* 4. APPOINTMENT SETTINGS */}
          {activeTab === 'appointment' && (
            <form onSubmit={handleSaveAppointmentSettings} className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Appointment Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure default consultation slots, working schedule, and opening hours
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Default Appointment Duration (minutes)
                  </label>
                  <select
                    value={appointmentSettings.defaultDuration}
                    onChange={(e) =>
                      setAppointmentSettings({
                        ...appointmentSettings,
                        defaultDuration: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Clinic Working Days
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday',
                    ].map((day) => {
                      const isSelected = appointmentSettings.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Clinic Opening Time
                    </label>
                    <input
                      type="text"
                      value={appointmentSettings.openingTime}
                      onChange={(e) =>
                        setAppointmentSettings({
                          ...appointmentSettings,
                          openingTime: e.target.value,
                        })
                      }
                      placeholder="08:00 AM"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Clinic Closing Time
                    </label>
                    <input
                      type="text"
                      value={appointmentSettings.closingTime}
                      onChange={(e) =>
                        setAppointmentSettings({
                          ...appointmentSettings,
                          closingTime: e.target.value,
                        })
                      }
                      placeholder="05:00 PM"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          )}

          {/* 5. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control internal alerts and clinical reminder dispatches
                </p>
              </div>

              <div className="space-y-3 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Appointment Reminders
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Send automatic reminders to patients 24h prior to consultation
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.appointmentReminders}
                    onChange={(e) =>
                      setNotifications({ ...notifications, appointmentReminders: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      New Appointment Notifications
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Alert doctor dashboard when new bookings are created
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.newAppointmentNotifications}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        newAppointmentNotifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      System Notifications
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Receive administrative updates and database status alerts
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.systemNotifications}
                    onChange={(e) =>
                      setNotifications({ ...notifications, systemNotifications: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* 6. SYSTEM PREFERENCES */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSavePreferences} className="space-y-5 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">System Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure localization formats and visual themes
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Interface Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="English">English</option>
                    <option value="Luganda">Luganda</option>
                    <option value="Swahili">Swahili</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Date Format
                  </label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (27/09/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-27)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (09/27/2026)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Theme Mode
                  </label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Light">Light (Standard Clinic SaaS)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
