import React, { useState } from 'react';
import {
  ShieldCheck,
  User as UserIcon,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  Cpu,
  BadgeCheck,
} from 'lucide-react';
import { useAuth, DEMO_ADMIN, DEMO_USER } from '../context/AuthContext';
import { PageView } from '../types/navigation';
import { UserRole } from '../types/auth';

interface LoginPageProps {
  onNavigate: (page: PageView) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, register, quickLogin, isAuthenticated, user } = useAuth();

  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('user');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Switch tabs & fill defaults
  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setError(null);
    if (!isRegisterMode) {
      if (role === 'admin') {
        setEmail(DEMO_ADMIN.email);
        setPassword('Admin2026!');
      } else {
        setEmail(DEMO_USER.email);
        setPassword('User2026!');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const res = await register({
          name,
          email,
          password,
          role: activeRoleTab,
        });
        if (!res.success) {
          setError(res.error || 'Registration failed. Please try again.');
          setIsLoading(false);
          return;
        }
      } else {
        const res = await login({
          email,
          password,
          role: activeRoleTab,
        });
        if (!res.success) {
          setError(res.error || 'Invalid credentials. Please verify and try again.');
          setIsLoading(false);
          return;
        }
      }

      // Navigate based on role
      if (activeRoleTab === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('calculators');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    quickLogin(role);
    if (role === 'admin') {
      onNavigate('admin');
    } else {
      onNavigate('calculators');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8">
      {/* Already logged in alert banner */}
      {isAuthenticated && user && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              {user.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                Signed in as {user.name}
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300">
                Email: {user.email} • Session Active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {user.role === 'admin' ? (
              <button
                onClick={() => onNavigate('admin')}
                className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                Go to Admin Portal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('saved')}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                My Calculations <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onNavigate('calculators')}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors"
            >
              Calculators
            </button>
          </div>
        </div>
      )}

      {/* Main Login Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Info & Quick 1-Click Fillers */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Role-Based Access Engine
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome to <span className="text-emerald-400">FinanceCalc</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Choose between standard User access for personal portfolios or Administrator access for platform calibration and benchmark telemetry.
              </p>

              <div className="pt-2 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">User Accounts:</strong> Save calculations, compare amortization models, export CSVs, and store custom presets.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Admin Accounts:</strong> Monitor real-time system audit logs, tune default benchmark interest rates, and oversee platform users.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Demo Login Panel */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Instant 1-Click Demo Logins
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold">
                No typing required
              </span>
            </div>

            {/* Quick User Card */}
            <div
              onClick={() => handleQuickDemo('user')}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 bg-slate-50/70 dark:bg-slate-950/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Standard User Demo
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {DEMO_USER.email}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Quick Admin Card */}
            <div
              onClick={() => handleQuickDemo('admin')}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500/80 bg-slate-50/70 dark:bg-slate-950/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Administrator Demo
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {DEMO_ADMIN.email}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>

        {/* Right Col: Authentication Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleRoleTabChange('user')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeRoleTab === 'user'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Standard User</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeRoleTab === 'admin'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Administrator</span>
              </button>
            </div>

            {/* Form Title & Subtitle */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isRegisterMode ? 'Create an Account' : 'Sign In'}
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                    activeRoleTab === 'admin'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {activeRoleTab === 'admin' ? 'Admin Access' : 'User Access'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRegisterMode
                  ? 'Register your profile to preserve calculation sessions across devices.'
                  : activeRoleTab === 'admin'
                  ? 'Sign in with your administrator credentials to access platform controls.'
                  : 'Enter your credentials or click a demo button to continue.'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name for Register Mode */}
              {isRegisterMode && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Connor"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activeRoleTab === 'admin' ? 'admin@fincal.app' : 'user@example.com'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeRoleTab === 'admin') {
                        setEmail(DEMO_ADMIN.email);
                        setPassword('Admin2026!');
                      } else {
                        setEmail(DEMO_USER.email);
                        setPassword('User2026!');
                      }
                    }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" /> Auto-fill Demo
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Mode Toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError(null);
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                  activeRoleTab === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
                }`}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Complete Registration' : `Sign In as ${activeRoleTab === 'admin' ? 'Administrator' : 'User'}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Guest Return Link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('calculators')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Continue as Guest without signing in →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
