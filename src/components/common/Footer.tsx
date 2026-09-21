import React from 'react';
import { Calculator, ShieldCheck, Heart } from 'lucide-react';
import { PageView } from '../../types/navigation';
import { CalculatorId } from '../../types/calculators';

interface FooterProps {
  onNavigate: (page: PageView, calcId?: CalculatorId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                FIN<span className="text-emerald-500">CAL</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              FINCAL is a professional Financial Planning & Decision-Support Platform providing mathematically exact amortization, wealth accumulation simulations, debt optimization models, and side-by-side scenario evaluations.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Institutional-grade formulas • 18 Financial Engines • Default Currency: NGN (₦)</span>
            </div>
          </div>

          {/* Quick Calculators Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              The 4 Suites
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'mortgage')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Mortgage & PITI Analysis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'home-affordability')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Home Affordability (28/36 DTI)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'multi-debt-payoff')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Multi-Debt Payoff Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'retirement')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Retirement & Nest Egg
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'net-worth')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Net Worth & Asset Allocation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'scenarios')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Scenario Comparison Tool
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Disclaimers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Platform & Workspace
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Financial Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  About & Methodologies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-purple-500 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  <span>Admin Intelligence Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('saved')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Saved Models & Portfolio
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} FINCAL — Financial Planning & Decision-Support Platform. All rights reserved.
          </p>
          <p className="text-center sm:text-right max-w-xl text-[11px] leading-normal">
            Advisory Notice: FINCAL tools and models are designed for informational, educational, and decision-support modeling. All simulations provide mathematical estimates and do not constitute formal fiduciary, legal, tax, or mortgage lending advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
