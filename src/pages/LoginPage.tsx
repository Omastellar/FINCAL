import React, { useState } from 'react';
import {
  ShieldCheck,
  User as UserIcon,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageView } from '../types/navigation';
import { UserRole } from '../types/auth';

interface LoginPageProps {
  onNavigate: (page: PageView) => void;
  initialRole?: UserRole;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, initialRole = 'user' }) => {
  const { login, register, resetPassword, isAuthenticated, user } = useAuth();

  const isAdminPortal = initialRole === 'admin';
  const activeRoleTab: UserRole = isAdminPortal ? 'admin' : 'user';

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);

  // Form Fields - starts clean and empty, no demo pre-fills
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(cleanEmail, newPassword);
      if (res.success) {
        setSuccessNotice('Your password has been reset successfully! You can now sign in.');
        setPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsForgotPasswordMode(false);
        }, 1800);
      } else {
        setError(res.error || 'Password reset failed. Please check your email and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let destinationRole: UserRole = activeRoleTab;
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
        if (res.user?.role) destinationRole = res.user.role;
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
        if (res.user?.role) destinationRole = res.user.role;
      }

      // Navigate to destination: Admins / Super Admins -> Admin Portal, Users -> Users Interface
      if (destinationRole === 'admin' || destinationRole === 'superadmin') {
        onNavigate('admin');
      } else {
        onNavigate('user');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-lg mx-auto py-4 sm:py-8 px-4">
      {/* Already logged in alert banner */}
      {isAuthenticated && user && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${
              user.role === 'superadmin' ? 'bg-amber-600' : user.role === 'admin' ? 'bg-purple-600' : 'bg-emerald-500'
            } text-white flex items-center justify-center font-bold shrink-0`}>
              {user.role === 'superadmin' ? (
                <Crown className="w-5 h-5" />
              ) : user.role === 'admin' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2 text-sm">
                Signed in as {user.name}
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider ${
                    user.role === 'superadmin'
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      : user.role === 'admin'
                      ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {user.role === 'superadmin' ? 'Super Admin' : user.role}
                </span>
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300">
                {user.email} • Session Active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(user.role === 'admin' || user.role === 'superadmin') ? (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex-1 sm:flex-none px-3.5 py-2 ${
                  user.role === 'superadmin' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'
                } text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer`}
              >
                {user.role === 'superadmin' ? 'Super Admin Portal' : 'Admin Portal'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('user')}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                My Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onNavigate('calculators')}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Calculators
            </button>
          </div>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Form Title & Subtitle */}
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                isAdminPortal
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isAdminPortal ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Platform Security Portal
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5" /> Personal Financial Portal
                </>
              )}
            </div>

            {isForgotPasswordMode && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordMode(false);
                  setError(null);
                  setSuccessNotice(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer mb-2"
                title="Back to Sign In"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isForgotPasswordMode
              ? 'Reset Password'
              : isRegisterMode
              ? 'Create an Account'
              : isAdminPortal
              ? 'Administrator Sign In'
              : 'Sign In to Your Account'}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isForgotPasswordMode
              ? 'Enter your account email and specify a new password to regain access.'
              : isRegisterMode
              ? 'Register your profile to access all calculators and manage financial models.'
              : isAdminPortal
              ? 'Sign in with your administrative credentials to access platform controls.'
              : 'Enter your email and password to access the financial calculators.'}
          </p>
        </div>

        {/* Tab Switcher for Sign In vs Register (standard user portal only) */}
        {!isAdminPortal && !isForgotPasswordMode && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError(null);
                setSuccessNotice(null);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                !isRegisterMode
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError(null);
                setSuccessNotice(null);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isRegisterMode
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Success message */}
        {successNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Forgot Password Mode Form */}
        {isForgotPasswordMode ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* Reset Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update & Reset Password</span>
                </>
              )}
            </button>

            {/* Back to Sign In */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordMode(false);
                  setError(null);
                  setSuccessNotice(null);
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                ← Remember your password? Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Standard Login & Register Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Register Mode */}
            {isRegisterMode && !isAdminPortal && (
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
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdminPortal ? 'admin@fincal.app' : 'user@example.com'}
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
                    setIsForgotPasswordMode(true);
                    setError(null);
                    setSuccessNotice(null);
                  }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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

              {!isAdminPortal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError(null);
                    setSuccessNotice(null);
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                >
                  {isRegisterMode
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Register"}
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isAdminPortal
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
              }`}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    {isRegisterMode
                      ? 'Complete Registration'
                      : isAdminPortal
                      ? 'Sign In to Admin Portal'
                      : 'Sign In to FINCAL'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Navigation / Return Links */}
            <div className="pt-2 text-center">
              {isAdminPortal ? (
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer"
                >
                  ← Return to Standard User Login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  ← Return to Home
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
