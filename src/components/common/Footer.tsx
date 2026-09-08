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
                Finance<span className="text-emerald-500">Calc</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Modern, mathematically sound financial tools designed to help individuals and businesses make smarter borrowing, savings, investment, and budgeting decisions.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Independent formulas • Zero tracking • Default currency: NGN (₦)</span>
            </div>
          </div>

          {/* Quick Calculators Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Calculators
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'loan')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Loan Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'savings')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Savings Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'compound-interest')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Compound Interest
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'investment')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Investment Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'debt-payoff')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Debt Payoff Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('calculators', 'budget')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  Budget Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Disclaimers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Resources & About
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-500 transition-colors"
                >
                  About & Methodologies
                </button>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500 cursor-not-allowed">
                  API & Integrations (Coming soon)
                </span>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500 cursor-not-allowed">
                  Export to PDF (Coming soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} Finance Calculator. All rights reserved.
          </p>
          <p className="text-center sm:text-right max-w-xl text-[11px] leading-normal">
            Disclaimer: The tools and figures provided are for informational purposes only and do not constitute formal financial, legal, or investment advice. Investment projections are estimates and never guaranteed.
          </p>
        </div>
      </div>
    </footer>
  );
};
