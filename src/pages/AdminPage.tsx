import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  Sliders,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Settings,
  Database,
  Lock,
  UserCheck,
  UserX,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import { useAuth, DEMO_ADMIN, DEMO_USER } from '../context/AuthContext';
import { PageView } from '../types/navigation';
import { UserRole, VisitorSession } from '../types/auth';
import { getTelemetrySummary } from '../utils/telemetry';

interface AdminPageProps {
  onNavigate: (page: PageView) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const {
    user,
    isAdmin,
    auditLogs,
    platformSettings,
    updatePlatformSettings,
    savedCalculations,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'benchmarks' | 'users' | 'logs'>('overview');
  const [benchmarkRate, setBenchmarkRate] = useState<number>(platformSettings.benchmarkInterestRate);
  const [inflationRate, setInflationRate] = useState<number>(platformSettings.defaultInflationRate);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [telemetry, setTelemetry] = useState(() => getTelemetrySummary());
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'registered' | 'unregistered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTelemetry(getTelemetrySummary());
      setIsRefreshing(false);
    }, 400);
  };

  const getDeviceIcon = (device?: string) => {
    const d = (device || '').toLowerCase();
    if (d.includes('mobile') || d.includes('android') || d.includes('ios')) {
      return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
    }
    if (d.includes('tablet') || d.includes('ipad')) {
      return <Tablet className="w-3.5 h-3.5 text-slate-500" />;
    }
    return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
  };

  // If unauthorized, show security gate
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Administrator Access Required
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This management console is restricted to authenticated system administrators. Please sign in with an Administrator profile to view this area.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('admin-login')}
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-md transition-colors"
          >
            Go to Admin Login
          </button>
          <button
            onClick={() => onNavigate('calculators')}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            Back to Calculators
          </button>
        </div>
      </div>
    );
  }

  const handleSaveBenchmarkSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings({
      benchmarkInterestRate: benchmarkRate,
      defaultInflationRate: inflationRate,
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const registeredUsersList = React.useMemo(() => {
    const baseList = [
      {
        id: DEMO_ADMIN.id,
        name: DEMO_ADMIN.name,
        email: DEMO_ADMIN.email,
        role: 'admin' as UserRole,
        title: DEMO_ADMIN.title || 'Lead Fintech Architect',
        status: 'Active',
        lastActive: 'Online',
      },
      {
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        role: 'user' as UserRole,
        title: DEMO_USER.title || 'Portfolio Investor',
        status: 'Active',
        lastActive: 'Recently',
      },
    ];

    try {
      const stored = localStorage.getItem('fincal_registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const registered = parsed.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role as UserRole,
            title: u.title || (u.role === 'admin' ? 'Administrator' : 'Standard User'),
            status: 'Active',
            lastActive: new Date(u.lastLogin || u.createdAt || Date.now()).toLocaleDateString(),
          }));
          return [...baseList, ...registered];
        }
      }
    } catch {
      // ignore
    }
    return baseList;
  }, []);

  const filteredSessions = useMemo(() => {
    return telemetry.recentSessions.filter((s) => {
      if (audienceFilter === 'registered' && s.type !== 'registered') return false;
      if (audienceFilter === 'unregistered' && s.type !== 'unregistered') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.userName?.toLowerCase().includes(q);
        const matchesEmail = s.userEmail?.toLowerCase().includes(q);
        const matchesId = s.id.toLowerCase().includes(q);
        const matchesLocation = s.location?.toLowerCase().includes(q);
        const matchesDevice = s.device?.toLowerCase().includes(q);
        const matchesTool = s.lastToolUsed?.toLowerCase().includes(q);
        return Boolean(
          matchesName ||
            matchesEmail ||
            matchesId ||
            matchesLocation ||
            matchesDevice ||
            matchesTool
        );
      }
      return true;
    });
  }, [telemetry.recentSessions, audienceFilter, searchQuery]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border border-purple-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> FINCAL Administrative Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Operations & Telemetry
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Logged in as <strong className="text-purple-300">{user?.name}</strong> ({user?.email}) • Lead Fintech Architect
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('calculators')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/10 transition-colors"
          >
            Launch Calculators
          </button>
          <button
            onClick={() => {
              logout();
              onNavigate('login');
            }}
            className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-semibold border border-red-500/30 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip: Audience Intelligence & Platform Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total App Audience */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total App Audience</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {telemetry.totalVisitors} People
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
            <span>{telemetry.registeredCount} Registered</span>
            <span>•</span>
            <span>{telemetry.unregisteredCount} Guests</span>
          </div>
        </div>

        {/* Metric 2: Registered Members */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Members</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {telemetry.registeredCount} Accounts
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {telemetry.registeredCalculationsRun} authenticated calculations
          </div>
        </div>

        {/* Metric 3: Unregistered Guests */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Unregistered Guests</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {telemetry.unregisteredCount} Guests
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {telemetry.unregisteredCalculationsRun} anonymous calculations
          </div>
        </div>

        {/* Metric 4: Real-time Live Telemetry */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Telemetry</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {telemetry.activeNowCount} Active Now
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {telemetry.totalCalculationsRun} total platform computations
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" /> Platform Telemetry
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'benchmarks'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" /> Benchmark Parameters
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Audience & Users</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
            {telemetry.totalVisitors}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> System Audit Trail
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Platform Health & Engines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All 11 mathematical engines are running client-side with zero external mock latency.
            </p>
            <div className="space-y-2 pt-2">
              {[
                { name: 'Module 1: Loan & Amortization Engine', status: 'Optimal' },
                { name: 'Module 2: Prepayment & Acceleration Engine', status: 'Optimal' },
                { name: 'Module 3: Mortgage & PMI Schedule Engine', status: 'Optimal' },
                { name: 'Module 4: Auto Loan & Trade-in Model', status: 'Optimal' },
                { name: 'Module 5: Compound Multi-Frequency Engine', status: 'Optimal' },
                { name: 'Module 6: Investment & Return Engine', status: 'Optimal' },
                { name: 'Module 7: Retirement & Nest Egg Model', status: 'Optimal' },
                { name: 'Module 8: Savings & Cash Flow Engine', status: 'Optimal' },
                { name: 'Module 9: Net Worth & Asset Ratio Engine', status: 'Optimal' },
                { name: 'Module 10: Multi-Bracket Tax Engine', status: 'Optimal' },
                { name: 'Module 11: Real-Time Currency Matrix', status: 'Optimal' },
              ].map((engine, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">{engine.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    {engine.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" /> Platform Security & Policies
            </h3>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Allow Public Guest Calculations</div>
                  <div className="text-slate-500">Allows non-authenticated users to compute numbers freely</div>
                </div>
                <input
                  type="checkbox"
                  checked={platformSettings.allowGuestCalculations}
                  onChange={(e) => updatePlatformSettings({ allowGuestCalculations: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Maintenance Mode Gate</div>
                  <div className="text-slate-500">Show maintenance banner for regular users</div>
                </div>
                <input
                  type="checkbox"
                  checked={platformSettings.maintenanceMode}
                  onChange={(e) => updatePlatformSettings({ maintenanceMode: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Default Baseline Currency</div>
                  <div className="text-slate-500">Global initialization currency</div>
                </div>
                <span className="font-mono font-bold px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-md">
                  {platformSettings.defaultCurrency} (Nigerian Naira)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="max-w-2xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-500" /> Central Bank Benchmark Calibration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update reference macro-economic parameters used as defaults across investment and inflation models.
            </p>
          </div>

          {saveSuccessNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Platform benchmark rates successfully synchronized!</span>
            </div>
          )}

          <form onSubmit={handleSaveBenchmarkSettings} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Benchmark Policy Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={benchmarkRate}
                onChange={(e) => setBenchmarkRate(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <span className="text-[11px] text-slate-400">
                Baseline borrowing interest rate suggested for loan & mortgage modules.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Macro Inflation Benchmark (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <span className="text-[11px] text-slate-400">
                Baseline inflation rate applied to purchasing power erosion models.
              </span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-md shadow-purple-500/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save & Broadcast Parameters
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Audience & User Intelligence */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Top Visualizer Card: Audience Ratio & Comparison */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Audience Intelligence & Proportions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time ratio comparing registered members with unregistered (guest) visitors across FINCAL.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefreshTelemetry}
                disabled={isRefreshing}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>
            </div>

            {/* Proportional Ratio Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                  Registered Members: {telemetry.registeredCount} (
                  {(
                    (telemetry.registeredCount / (telemetry.totalVisitors || 1)) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Unregistered Guests: {telemetry.unregisteredCount} (
                  {(
                    (telemetry.unregisteredCount / (telemetry.totalVisitors || 1)) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                <div
                  style={{
                    width: `${
                      (telemetry.registeredCount / (telemetry.totalVisitors || 1)) *
                      100
                    }%`,
                  }}
                  className="bg-purple-600 h-full transition-all duration-500"
                  title={`Registered: ${telemetry.registeredCount}`}
                />
                <div
                  style={{
                    width: `${
                      (telemetry.unregisteredCount / (telemetry.totalVisitors || 1)) *
                      100
                    }%`,
                  }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Unregistered: ${telemetry.unregisteredCount}`}
                />
              </div>
            </div>

            {/* Comparison Cards: Registered vs Unregistered */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        Registered User Accounts
                      </div>
                      <div className="text-[11px] text-purple-700 dark:text-purple-300">
                        Authenticated Client Profiles
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase">
                    Member Base
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-purple-200/50 dark:border-purple-800/30">
                  <div>
                    <div className="text-lg font-extrabold text-purple-700 dark:text-purple-300">
                      {telemetry.registeredCount}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Users</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-purple-700 dark:text-purple-300">
                      {telemetry.registeredCalculationsRun}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Calculations</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-purple-700 dark:text-purple-300">
                      {(
                        telemetry.registeredCalculationsRun /
                        (telemetry.registeredCount || 1)
                      ).toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Avg Calcs/User</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl">
                  Enjoy authenticated profile preferences, saved calculation history, and persistent settings.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      <UserX className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        Unregistered Guest Visitors
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-300">
                        Anonymous Public Sessions
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase">
                    Guest Base
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-amber-200/50 dark:border-amber-800/30">
                  <div>
                    <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                      {telemetry.unregisteredCount}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Guests</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                      {telemetry.unregisteredCalculationsRun}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Calculations</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                      {(
                        telemetry.unregisteredCalculationsRun /
                        (telemetry.unregisteredCount || 1)
                      ).toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Avg Calcs/Guest</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl">
                  Unrestricted access to all financial models without requiring account registration.
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Popularity by Audience Type */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Calculator Module Popularity by User Classification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Breakdown of computations executed by registered users vs unregistered guest visitors.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Calculator Tool</th>
                    <th className="px-4 py-3 text-purple-700 dark:text-purple-400">Registered Users</th>
                    <th className="px-4 py-3 text-amber-700 dark:text-amber-400">Unregistered Guests</th>
                    <th className="px-4 py-3">Total Calculations</th>
                    <th className="px-4 py-3 rounded-r-xl">Usage Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(telemetry.calculatorPopularity).map(([toolName, stats]) => {
                    return (
                      <tr key={toolName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {toolName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {stats.registered}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({Math.round((stats.registered / (telemetry.registeredCalculationsRun || 1)) * 100)}%)
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {stats.unregistered}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({Math.round((stats.unregistered / (telemetry.unregisteredCalculationsRun || 1)) * 100)}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                          {stats.total}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 max-w-xs">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                              <div
                                style={{
                                  width: `${(stats.registered / (stats.total || 1)) * 100}%`,
                                }}
                                className="bg-purple-500 h-full"
                              />
                              <div
                                style={{
                                  width: `${(stats.unregistered / (stats.total || 1)) * 100}%`,
                                }}
                                className="bg-amber-500 h-full"
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {stats.total} calcs
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Directory & Sessions Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Visitor Sessions & Identity Directory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive audit table of active and recent visitor sessions across the platform.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setAudienceFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    audienceFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({telemetry.totalVisitors})
                </button>
                <button
                  onClick={() => setAudienceFilter('registered')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    audienceFilter === 'registered'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Registered ({telemetry.registeredCount})
                </button>
                <button
                  onClick={() => setAudienceFilter('unregistered')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    audienceFilter === 'unregistered'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Guests ({telemetry.unregisteredCount})
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, guest ID, location, or device..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Sessions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">User / Identity</th>
                    <th className="px-4 py-3">Visitor Type</th>
                    <th className="px-4 py-3">Device & Client</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Last Activity</th>
                    <th className="px-4 py-3">Calculations</th>
                    <th className="px-4 py-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No visitor sessions matched your filter or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          {s.type === 'registered' ? (
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{s.userName || 'Registered Member'}</span>
                              </div>
                              <div className="text-[11px] text-purple-600 dark:text-purple-400">
                                {s.userEmail || s.userId}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                                {s.id}
                              </div>
                              <div className="text-[11px] text-amber-600 dark:text-amber-400">
                                Anonymous Guest Visitor
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {s.type === 'registered' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                              Registered
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                              Unregistered
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            {getDeviceIcon(s.device)}
                            <span>{s.device} • {s.browser}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {s.lastToolUsed}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(s.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
                            {s.calculationsRun} calcs
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {s.status === 'online' || s.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Idle
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registered Database Profiles Reference Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                Persistent Registered User Accounts
              </h3>
              <span className="text-xs text-slate-500">{registeredUsersList.length} Accounts in Database</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">User Profile</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3 rounded-r-xl">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {registeredUsersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">{u.title}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{u.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" /> Platform Security & Audit Trail
            </h3>
            <span className="text-xs text-slate-500">{auditLogs.length} Total Events Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Timestamp</th>
                  <th className="px-4 py-3">Event Action</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 rounded-r-xl">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 font-medium">{log.performedBy}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
