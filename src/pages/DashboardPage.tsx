import React from 'react';
import {
  Compass,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Target,
  Columns3,
  ArrowRight,
  Sparkles,
  Activity,
  Award,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { CalculatorId, CalculatorSuite } from '../types/calculators';
import { PageView } from '../types/navigation';
import { CALCULATORS_LIST } from '../data/calculatorMetadata';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';

interface DashboardPageProps {
  onNavigate: (page: PageView, calcId?: CalculatorId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currencyConfig, format } = useCurrency();
  const { user, isAuthenticated } = useAuth();

  const suites: Array<{
    title: CalculatorSuite;
    desc: string;
    icon: React.ReactNode;
    color: string;
    calcIds: CalculatorId[];
  }> = [
    {
      title: 'Loans',
      desc: 'Mortgage PITI, home affordability, auto loans, and personal borrowing.',
      icon: <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20',
      calcIds: ['mortgage', 'home-affordability', 'auto-loan', 'personal-loan', 'loan'],
    },
    {
      title: 'Savings & Investments',
      desc: 'Compound wealth, retirement nest eggs, and target milestone goals.',
      icon: <PiggyBank className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: 'border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20',
      calcIds: ['savings', 'savings-goal', 'compound-interest', 'investment', 'retirement'],
    },
    {
      title: 'Budget & Debt',
      desc: '14-category budgets, Avalanche vs Snowball debt plans, DTI, and net worth.',
      icon: <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      color: 'border-purple-500/20 bg-purple-50/30 dark:bg-purple-950/20',
      calcIds: ['budget', 'multi-debt-payoff', 'dti', 'net-worth', 'debt-payoff'],
    },
    {
      title: 'Planning & Decisions',
      desc: 'Goal prioritization, scenario A vs B modeling, and multi-currency FX matrix.',
      icon: <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      color: 'border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20',
      calcIds: ['financial-goals', 'scenarios', 'currency-converter'],
    },
  ];

  const quickDecisions = [
    {
      label: 'Home Purchase Capacity',
      question: 'How much house can I afford under 28/36 underwriting guidelines?',
      calcId: 'home-affordability' as CalculatorId,
      badge: 'Loans',
    },
    {
      label: 'Debt Freedom Strategy',
      question: 'Which saves more money: Avalanche or Snowball debt payoff?',
      calcId: 'multi-debt-payoff' as CalculatorId,
      badge: 'Debt',
    },
    {
      label: 'Retirement Nest Egg Readiness',
      question: 'Will my current monthly contributions sustain my retirement lifestyle?',
      calcId: 'retirement' as CalculatorId,
      badge: 'Retirement',
    },
    {
      label: 'Strategic Trade-Off Modeling',
      question: 'Should I choose a 15-year or 30-year mortgage, or Buy vs Rent?',
      calcId: 'scenarios' as CalculatorId,
      badge: 'Decisions',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-700/50">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            FINCAL Financial Planning & Decision-Support Platform
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Your centralized command center for institutional borrowing analysis, wealth accumulation projections, multi-debt payoff planning, and strategic decision modeling.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onNavigate('calculators')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
            >
              Explore 18 Financial Engines <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('calculators', 'scenarios')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5"
            >
              <Columns3 className="w-4 h-4 text-emerald-400" /> Scenario Comparison
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Decision-Support Quick Launchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Strategic Decision-Support Tools
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant answers to core financial dilemmas backed by transparent mathematical models.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickDecisions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('calculators', item.calcId)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mb-2.5 inline-block">
                  {item.badge}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.question}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Run Simulation</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The 4 Financial Suites Directory */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          The 4 Financial Planning Suites
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suites.map((suite, idx) => (
            <Card key={idx} className={`!p-6 border ${suite.color}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs">
                  {suite.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {suite.title} Suite
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {suite.desc}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80">
                {suite.calcIds.map((cid) => {
                  const meta = CALCULATORS_LIST.find((c) => c.id === cid);
                  if (!meta) return null;
                  return (
                    <div
                      key={cid}
                      onClick={() => onNavigate('calculators', cid)}
                      className="py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {meta.title}
                        </span>
                        {meta.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                            {meta.badge}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
