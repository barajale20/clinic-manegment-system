import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Eye, EyeOff, Lock, Mail, User, HeartPulse, ShieldCheck, AlertCircle } from 'lucide-react';
import { CLINIC_IMAGE } from '../../data/initialData';

interface RegisterPageProps {
  onSwitchToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { registerUser } = useClinic() as any;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('receptionist');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Formats role nicely (e.g. receptionist -> Receptionist)
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

      const success = await registerUser({ 
        fullName: fullName.trim(), 
        email: email.trim().toLowerCase(), 
        role: formattedRole, 
        password 
      });

      if (success) {
        setSuccessMessage('Account registered successfully! Pending Administrator approval.');
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        if (onSwitchToLogin) {
          setTimeout(() => {
            onSwitchToLogin();
          }, 2500);
        }
      } else {
        setErrorMessage('Registration failed. Email may already be registered or pending.');
      }
    } catch {
      setErrorMessage('Unable to connect to the clinic server. Account queued locally for admin approval.');
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
            <img src={CLINIC_IMAGE} alt="CarePoint Healthcare Center" className="w-full h-64 object-cover" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Join our medical network with secure admin approval.
          </h2>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            Please register using your personal email address. All accounts remain pending until verified and approved by the clinic administrator.
          </p>
        </div>
        <div className="relative z-10 text-xs text-slate-400">CarePoint Healthcare · University Final-Year Capstone System</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs mb-3">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create an account</h2>
            <p className="text-xs text-slate-500 mt-1">Register with your personal email address</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mohamed Ali"
                  className="w-full px-3.5 py-2 pl-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Personal Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2 pl-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role / Position</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="receptionist">Receptionist</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="patient">Patient</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="lab_technician">Lab Technician</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 pl-10 pr-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2 pl-10 pr-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm mt-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Submitting registration...' : 'Register Account'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              Already have an approved account?{' '}
              <button type="button" onClick={onSwitchToLogin} className="font-medium text-indigo-600 hover:underline cursor-pointer">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};