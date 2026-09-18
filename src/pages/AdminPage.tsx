import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth, DEMO_ADMIN, DEMO_USER } from '../context/AuthContext';
import { PageView } from '../types/navigation';
import { UserRole } from '../types/auth';

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
            onClick={() => onNavigate('login')}
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

  const registeredUsersList = [
    {
      id: DEMO_ADMIN.id,
      name: DEMO_ADMIN.name,
      email: DEMO_ADMIN.email,
      role: 'admin' as UserRole,
      title: DEMO_ADMIN.title || 'Lead Fintech Architect',
      status: 'Active',
      lastActive: 'Just now',
    },
    {
      id: DEMO_USER.id,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      role: 'user' as UserRole,
      title: DEMO_USER.title || 'Portfolio Investor',
      status: 'Active',
      lastActive: '5 mins ago',
    },
  ];

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

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Engine Status</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            100% Operational
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            All 11 modules validated
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Benchmark Lending</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {platformSettings.benchmarkInterestRate.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Central bank reference rate
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Sessions</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {savedCalculations.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Client-side persisted models
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Security Logs</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {auditLogs.length} Events
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Real-time telemetry tracked
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
          <Users className="w-4 h-4" /> User Directory
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

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" /> Platform User Directory
            </h3>
            <span className="text-xs text-slate-500">2 Active Profiles</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">User Profile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
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
