import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { CLINIC_IMAGE } from '../../data/initialData';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginPageProps {
  onSwitchToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useClinic();

  const [email, setEmail] = useState('admin@carepoint.com');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    if (selectedRole === 'admin') {
      setEmail('admin@carepoint.com');
    } else {
      setEmail('');
    }

    // Never auto-fill a password. The user must enter their own password.
    setPassword('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password || !role) {
      setErrorMessage('Please fill in all fields and select a role.');
      return;
    }

    setLoading(true);

    try {
      const success = await login(email.trim(), password, rememberMe, role);

      if (!success) {
        setErrorMessage(
          'Login failed. Check your email, password and selected role. If your account is new, it must first be approved by Admin.'
        );
      }
    } catch {
      setErrorMessage('Unable to connect to the clinic server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">CarePoint Clinic</h1>
            <p className="text-xs text-indigo-200">Clinical Management System</p>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl mb-8 bg-slate-800">
            <img
              src={CLINIC_IMAGE}
              alt="CarePoint Healthcare Center"
              className="w-full h-64 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Simple healthcare management for better patient care.
          </h2>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Unified electronic medical records, streamlined patient appointments, and seamless
            clinical workflows engineered for modern primary healthcare teams.
          </p>

          <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Electronic Medical Records</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          CarePoint Healthcare · University Final-Year Capstone System
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs mb-3">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in to your account to continue</p>
          </div>

          <div className="mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-[11px] font-semibold text-slate-700 block mb-2 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              Select Role / Position
            </label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            >
              <option value="admin">Administrator</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="patient">Patient</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_technician">Lab Technician</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your email address"
                  className="w-full px-3.5 py-2.5 pl-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pl-10 pr-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none"
              >
                Register now
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Secure access for authorized clinic staff
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onBackToLogin={() => setShowForgotModal(false)}
      />
    </div>
  );
};
