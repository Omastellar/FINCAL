import React from 'react';
import {
  ShieldCheck,
  Calculator,
  Code2,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { PageView } from '../types/navigation';
import { CalculatorId } from '../types/calculators';

interface AboutPageProps {
  onNavigate: (page: PageView, calcId?: CalculatorId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Institutional Financial Precision & Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About FINCAL Platform
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An institutional-grade Financial Planning & Decision-Support Platform engineered to deliver mathematically verified computations, transparent underwriting methodologies, and explainable decision insights across 18 financial engines.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Mathematical Integrity
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every calculation—from amortizing mortgages to compound interest and accelerated debt reduction—uses closed-form actuarial formulas. Edge cases like 0% interest and negative balances are gracefully resolved.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            100% Client-Side Privacy
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All arithmetic and data visualization are computed locally in your browser. No income figures, loan sums, or personal financial details ever leave your machine.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Clean Separation of Logic
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Financial formulas exist strictly within isolated mathematical utility modules (`src/utils/financialMath.ts`), independent from UI rendering components for maximum testability.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Multi-Currency Flexibility
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            With Nigerian Naira (NGN ₦) set as the primary standard, you can dynamically switch between USD ($), GBP (£), and EUR (€) with instant formatting updates across all tools.
          </p>
        </Card>
      </div>

      {/* Future Roadmap Note */}
      <Card className="space-y-4 bg-gradient-to-br from-slate-50 to-emerald-500/5 dark:from-slate-900 dark:to-emerald-950/20">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Architected for Enterprise Growth</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Modular Extensibility
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The MVP is structured with clean TypeScript boundaries, making it seamless to plug in future capabilities such as user accounts, PostgreSQL transaction persistence, multi-tenant dashboards, Azure cloud deployments, and AI financial advisory integrations without altering core calculation math.
        </p>
      </Card>

      {/* Disclaimers */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
          Important Regulatory Disclaimer
        </h4>
        <p className="leading-relaxed">
          The information, estimations, and tools presented within Finance Calculator are provided strictly for educational and illustrative purposes. Investment returns fluctuate and are never guaranteed. Past performance or sample interest rates do not ensure future outcomes. Users should consult licensed financial advisors before making substantial commitments.
        </p>
      </div>

      {/* Back to Calculators CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('calculators')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer"
        >
          <span>Explore All Calculators</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
