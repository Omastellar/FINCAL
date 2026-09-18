import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Flame,
  Wallet,
  Zap,
  ArrowRightLeft,
} from 'lucide-react';
import { CALCULATORS_LIST } from '../data/calculatorMetadata';
import { CalculatorId } from '../types/calculators';
import { LoanCalculator } from '../calculators/LoanCalculator';
import { SavingsCalculator } from '../calculators/SavingsCalculator';
import { CompoundInterestCalculator } from '../calculators/CompoundInterestCalculator';
import { InvestmentCalculator } from '../calculators/InvestmentCalculator';
import { DebtPayoffCalculator } from '../calculators/DebtPayoffCalculator';
import { BudgetCalculator } from '../calculators/BudgetCalculator';
import { CurrencyConverterCalculator } from '../calculators/CurrencyConverterCalculator';

interface CalculatorsPageProps {
  initialCalculatorId?: CalculatorId;
}

export const CalculatorsPage: React.FC<CalculatorsPageProps> = ({
  initialCalculatorId = 'loan',
}) => {
  const getCalcFromUrl = (): CalculatorId => {
    try {
      const search = new URLSearchParams(window.location.search);
      const param = search.get('calc');
      if (param === 'loan') return 'loan';
      if (param === 'savings') return 'savings';
      if (param === 'compound' || param === 'compound-interest') return 'compound-interest';
      if (param === 'investment') return 'investment';
      if (param === 'debt' || param === 'debt-payoff') return 'debt-payoff';
      if (param === 'budget') return 'budget';
      if (param === 'currency' || param === 'currency-converter') return 'currency-converter';
    } catch {
      // ignore
    }
    return initialCalculatorId;
  };

  const [activeCalcId, setActiveCalcId] = useState<CalculatorId>(getCalcFromUrl);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fromUrl = getCalcFromUrl();
    if (fromUrl) {
      setActiveCalcId(fromUrl);
    } else if (initialCalculatorId) {
      setActiveCalcId(initialCalculatorId);
    }
  }, [initialCalculatorId]);

  const categories = ['All', 'Borrowing', 'Growing', 'Planning'];

  const filteredCalculators = CALCULATORS_LIST.filter(
    (calc) => selectedCategory === 'All' || calc.category === selectedCategory
  );

  const getCalcIcon = (id: CalculatorId) => {
    switch (id) {
      case 'loan':
        return <CreditCard className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      case 'compound-interest':
        return <Zap className="w-4 h-4" />;
      case 'investment':
        return <BarChart3 className="w-4 h-4" />;
      case 'debt-payoff':
        return <Flame className="w-4 h-4" />;
      case 'budget':
        return <Wallet className="w-4 h-4" />;
      case 'currency-converter':
        return <ArrowRightLeft className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const renderActiveCalculator = () => {
    switch (activeCalcId) {
      case 'loan':
        return <LoanCalculator />;
      case 'savings':
        return <SavingsCalculator />;
      case 'compound-interest':
        return <CompoundInterestCalculator />;
      case 'investment':
        return <InvestmentCalculator />;
      case 'debt-payoff':
        return <DebtPayoffCalculator />;
      case 'budget':
        return <BudgetCalculator />;
      case 'currency-converter':
        return <CurrencyConverterCalculator />;
      default:
        return <LoanCalculator />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Pills & Quick Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            {filteredCalculators.length} available calculators
          </span>
        </div>

        {/* Calculator Tab Buttons Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {filteredCalculators.map((calc) => {
            const isActive = activeCalcId === calc.id;
            return (
              <button
                key={calc.id}
                onClick={() => {
                  setActiveCalcId(calc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {getCalcIcon(calc.id)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {calc.category}
                  </span>
                </div>
                <span className="text-xs font-bold leading-snug line-clamp-1">
                  {calc.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Calculator Component View */}
      <div className="pt-2">
        {renderActiveCalculator()}
      </div>
    </div>
  );
};
