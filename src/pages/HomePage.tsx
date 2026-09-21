import React from 'react';
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Flame,
  Wallet,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Zap,
  Globe,
  Sparkles,
  ArrowRightLeft,
  Home,
  Compass,
  Car,
  Target,
  UserCheck,
  Activity,
  Landmark,
  Columns3,
  LayoutDashboard,
} from 'lucide-react';
import { CALCULATORS_LIST } from '../data/calculatorMetadata';
import { CalculatorId } from '../types/calculators';
import { PageView } from '../types/navigation';
import { useCurrency } from '../context/CurrencyContext';

interface HomePageProps {
  onNavigate: (page: PageView, calcId?: CalculatorId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { currencyConfig } = useCurrency();

  const getCalculatorIcon = (id: CalculatorId) => {
    switch (id) {
      case 'loan':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'mortgage':
        return <Home className="w-5 h-5 text-emerald-500" />;
      case 'home-affordability':
        return <Compass className="w-5 h-5 text-emerald-500" />;
      case 'auto-loan':
        return <Car className="w-5 h-5 text-emerald-500" />;
      case 'personal-loan':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'savings':
        return <PiggyBank className="w-5 h-5 text-teal-500" />;
      case 'savings-goal':
        return <Target className="w-5 h-5 text-teal-500" />;
      case 'compound-interest':
        return <Zap className="w-5 h-5 text-indigo-500" />;
      case 'investment':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'retirement':
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'budget':
        return <Wallet className="w-5 h-5 text-purple-500" />;
      case 'debt-payoff':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'multi-debt-payoff':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'dti':
        return <Activity className="w-5 h-5 text-purple-500" />;
      case 'net-worth':
        return <Landmark className="w-5 h-5 text-purple-500" />;
      case 'financial-goals':
        return <Target className="w-5 h-5 text-amber-500" />;
      case 'scenarios':
        return <Columns3 className="w-5 h-5 text-amber-500" />;
      case 'currency-converter':
        return <ArrowRightLeft className="w-5 h-5 text-teal-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-500/10 via-slate-500/5 to-transparent border border-emerald-500/10 dark:border-emerald-500/5 px-6 sm:px-12 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          FINCAL Institutional Planning Platform
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Financial Planning & Decision-Support Platform
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mt-6 leading-relaxed font-normal">
          Institutional-grade modeling across 18 specialized engines. Analyze mortgage PITI, simulate multi-debt payoffs without bias, model retirement horizons, and compare complex financial scenarios side-by-side.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Financial Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('calculators')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 font-semibold text-base transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore 18 Engines</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Currency Highlight Badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>
            Default institutional currency: <strong className="text-slate-700 dark:text-slate-200">{currencyConfig.name} ({currencyConfig.symbol})</strong> • Live cross-rates for USD, GBP, EUR
          </span>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Mathematically Exact
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Real actuarial amortization and compounding formulas with 0% interest handling and zero dummy figures.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Explainable Results
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Transparent "How this was calculated" breakdowns showing underlying assumptions and step-by-step formulas.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Columns3 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Scenario Modeling
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Side-by-side comparative modeling for Buy vs Rent, 15 vs 30-year mortgages, and debt acceleration strategies.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Guest Access & Portfolios
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Immediate calculator access for all guests with registered portfolios for saving models across devices.
          </p>
        </div>
      </section>

      {/* 18 Calculators Explorer Grid */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              The 18 Financial Planning Engines
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select any specialized engine to run simulations, view schedules, and inspect mathematical proofs.
            </p>
          </div>
          <button
            onClick={() => onNavigate('calculators')}
            className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All by Suite</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CALCULATORS_LIST.map((calc) => (
            <div
              key={calc.id}
              onClick={() => onNavigate('calculators', calc.id)}
              className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-lg hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                    {getCalculatorIcon(calc.id)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {calc.suite}
                    </span>
                    {calc.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        {calc.badge}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {calc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {calc.shortDescription}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Launch Engine</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
